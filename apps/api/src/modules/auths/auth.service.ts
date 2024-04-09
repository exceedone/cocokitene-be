/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { UserRepository } from '@repositories/user.repository'
import { ConfigService } from '@nestjs/config'

import {
    GenerateAccessJWTData,
    GenerateAccessJWTSystemAdminData,
    LoginResponseData,
    SystemAdminLoginResponseData,
} from '@api/modules/auths/auth.interface'
import {
    TOKEN_VERIFY_EMAIL_EXPIRE_IN_MILISECOND,
    UserStatusEnum,
} from '@shares/constants'
import { httpErrors, messageLog } from '@shares/exception-filter'

import { uuid } from '@shares/utils/uuid'
import { User } from '@entities/user.entity'
import {
    generateAccessJWT,
    generateCryptoToken,
    generateRefreshTokenJWT,
    generateSystemAdminAccessJWT,
    generateSystemAdminRefreshJWT,
    verifyRefreshJWT,
    verifySystemAdminRefreshTokenJWT,
} from '@shares/utils/jwt'
import {
    ForgotPasswordDto,
    LoginByPassword,
    LoginDto,
    LoginUserByPassword,
    RefreshTokenDto,
    SystemAdminRefreshTokenDto,
} from 'libs/queries/src/dtos/auth.dto'
import { RoleService } from '@api/modules/roles/role.service'
import { UserRoleService } from '@api/modules/user-roles/user-role.service'
import { SystemAdminRepository } from '@repositories/system-admin.repository'
import { SystemAdmin } from '@entities/system-admin.entity'
import { ResetPasswordDto } from '@dtos/password.dto'
import { EmailService } from '@api/modules/emails/email.service'
import { ChangePasswordDto } from '@dtos/system-admin.dto'
import {
    comparePassword,
    comparePasswordUser,
    hashPassword,
    hashPasswordUser,
} from '@shares/utils'
import { CompanyRepository } from '@repositories/company.repository'
import { Logger } from 'winston'

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService,
        private readonly roleService: RoleService,
        private readonly userRoleService: UserRoleService,
        private readonly systemAdminRepository: SystemAdminRepository,
        private readonly emailService: EmailService,
        private readonly companyRepository: CompanyRepository,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async login(loginDto: LoginDto): Promise<LoginResponseData> {
        const {
            walletAddress,
            // , signature
        } = loginDto
        // check user exists
        const user = await this.userRepository.getUserByWalletAddress(
            walletAddress,
        )

        if (!user) {
            this.logger.info(
                `${messageLog.LOGIN_WALLET_ADDRESS_FAILED.message} ${walletAddress}`,
            )
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        if (user.userStatus.status !== UserStatusEnum.ACTIVE) {
            this.logger.info(
                `${messageLog.LOGIN_USER_INACTIVE.message} ${walletAddress}`,
            )
            throw new HttpException(
                httpErrors.USER_STATUS_INACTIVE,
                HttpStatus.FORBIDDEN,
            )
        }
        // get message have to sign
        // const signedMessage = getSignedMessage(user.nonce)
        // // verify signature
        // if (!isValidSignature(walletAddress, signature, signedMessage)) {
        //     throw new HttpException(
        //         httpErrors.INVALID_SIGNATURE,
        //         HttpStatus.BAD_REQUEST,
        //     )
        // }
        //update nonce();
        user.nonce = uuid()
        await user.save()

        const { userData, accessToken, refreshToken } =
            await this.generateResponseLoginData(user)
        this.logger.info(
            `${messageLog.LOGIN_WALLET_ADDRESS_SUCCESS.message}` +
                userData.walletAddress,
        )
        return {
            userData,
            accessToken,
            refreshToken,
        }
    }

    async generateResponseLoginData(user: User): Promise<LoginResponseData> {
        let accessToken
        let refreshToken
        let userData

        try {
            const roleIds = await this.userRoleService.getRoleIdsByUserId(
                user.id,
            )
            const permissionKeys =
                await this.roleService.getPermissionsByRoleId(roleIds)

            userData = {
                id: user.id,
                walletAddress: user.walletAddress,
                username: user.username,
                email: user.email,
                companyId: user.companyId,
                avatar: user.avatar,
                permissionKeys,
                status: user.userStatus,
            }

            accessToken = generateAccessJWT(userData, {
                expiresIn: Number(
                    this.configService.get('api.accessTokenExpireInSec'),
                ),
            })

            refreshToken = generateRefreshTokenJWT(userData, {
                expiresIn: Number(
                    this.configService.get('api.refreshTokenExpireInSec'),
                ),
            })
        } catch (error) {
            throw new HttpException(
                {
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        return {
            userData,
            accessToken,
            refreshToken,
        }
    }

    async generateNewAccessJWT(
        refreshTokenDto: RefreshTokenDto,
    ): Promise<GenerateAccessJWTData> {
        const refreshToken = refreshTokenDto.refreshToken
        let payload
        try {
            payload = await verifyRefreshJWT(refreshToken)
        } catch (error) {
            throw new HttpException(
                {
                    message: error.message,
                },
                HttpStatus.UNAUTHORIZED,
            )
        }
        const accessToken = generateAccessJWT(payload)
        return accessToken
    }

    async loginByPassword(
        loginByPassword: LoginByPassword,
    ): Promise<SystemAdminLoginResponseData> {
        const { email } = loginByPassword
        const systemAdmin =
            await this.systemAdminRepository.findSystemAdminByEmail(email)
        if (!systemAdmin) {
            throw new HttpException(
                httpErrors.SYSTEM_ADMIN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        const checkPassword = await comparePassword(
            loginByPassword.password,
            systemAdmin.password,
        )
        if (!checkPassword) {
            this.logger.info(
                `${messageLog.LOGIN_SYSTEM_FAILED.message} ${email}`,
            )
            throw new HttpException(
                httpErrors.SYSTEM_ADMIN_INVALID_PASSWORD,
                HttpStatus.FORBIDDEN,
            )
        }
        const { systemAdminData, accessToken, refreshToken } =
            await this.generateResponseSystemAdminLoginData(systemAdmin)

        this.logger.info(`${messageLog.LOGIN_SYSTEM_SUCCESS.message} ${email}`)
        return {
            systemAdminData,
            accessToken,
            refreshToken,
        }
    }

    async generateResponseSystemAdminLoginData(
        systemAdmin: SystemAdmin,
    ): Promise<SystemAdminLoginResponseData> {
        let accessToken
        let refreshToken
        let systemAdminData

        try {
            systemAdminData = { ...systemAdmin }
            delete systemAdminData.password
            accessToken = generateSystemAdminAccessJWT(systemAdminData, {
                expiresIn: Number(
                    this.configService.get(
                        'api.systemAdminAccessTokenExpireInSec',
                    ),
                ),
            })

            refreshToken = generateSystemAdminRefreshJWT(systemAdminData, {
                expiresIn: Number(
                    this.configService.get(
                        'api.systemAdminRefreshTokenExpireInSec',
                    ),
                ),
            })
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        return {
            systemAdminData,
            accessToken,
            refreshToken,
        }
    }

    async generateNewAccessJWTSystemAdmin(
        systemAdminRefreshTokenDto: SystemAdminRefreshTokenDto,
    ): Promise<GenerateAccessJWTSystemAdminData> {
        const systemAdminRefreshToken =
            systemAdminRefreshTokenDto.systemAdminRefreshToken
        let payload
        try {
            payload = await verifySystemAdminRefreshTokenJWT(
                systemAdminRefreshToken,
            )
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.UNAUTHORIZED,
            )
        }
        const systemAdminAccessToken = generateSystemAdminAccessJWT(payload)
        return systemAdminAccessToken
    }

    async sendEmailForgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto
        const existedSystemAdmin =
            await this.systemAdminRepository.findSystemAdminByEmail(email)
        if (!existedSystemAdmin) {
            throw new HttpException(
                httpErrors.SYSTEM_ADMIN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        existedSystemAdmin.resetPasswordToken = generateCryptoToken()
        existedSystemAdmin.resetPasswordExpireTime = new Date(
            Date.now() + TOKEN_VERIFY_EMAIL_EXPIRE_IN_MILISECOND,
        )
        await existedSystemAdmin.save()

        try {
            await this.emailService.sendEmailConfirmResetPassword(
                existedSystemAdmin,
            )
        } catch (error) {
            throw new HttpException(
                httpErrors.RESET_PASSWORD_TOKEN_SEND_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async verifyEmailAndResetPassword(
        linkToken: string,
        resetPasswordDto: ResetPasswordDto,
    ): Promise<string> {
        const { password, confirmPassword } = resetPasswordDto
        const systemAdmin =
            await this.systemAdminRepository.getSystemAdminByResetPasswordToken(
                linkToken,
            )
        if (!systemAdmin) {
            throw new HttpException(
                httpErrors.SYSTEM_ADMIN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        const currentTime = new Date()
        const expiredLinkToken = systemAdmin.resetPasswordExpireTime
        if (currentTime > expiredLinkToken) {
            this.logger.error(
                `${messageLog.RESET_PASSWORD_SYSTEM_FAILED.code} ${messageLog.RESET_PASSWORD_SYSTEM_FAILED.message} ${systemAdmin.email}`,
            )
            throw new HttpException(
                httpErrors.RESET_PASSWORD_TOKEN_EXPIRED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
        const newPasswordHashed = await hashPassword(password)
        systemAdmin.password = newPasswordHashed
        await systemAdmin.save()
        this.logger.info(
            `${messageLog.RESET_PASSWORD_SYSTEM_SUCCESS.message} ${systemAdmin.email}`,
        )
        return 'Reset Password Successfully'
    }

    async changePassword(
        systemAdminId: number,
        changePasswordDto: ChangePasswordDto,
    ) {
        const { currentPassword, newPassword } = changePasswordDto
        const existedSystemAdmin =
            await this.systemAdminRepository.getSystemAdminById(systemAdminId)
        if (!existedSystemAdmin) {
            throw new HttpException(
                httpErrors.SYSTEM_ADMIN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        const checkPassword = await comparePassword(
            currentPassword,
            existedSystemAdmin.password,
        )
        if (!checkPassword) {
            this.logger.info(
                `${messageLog.CHANGE_PASSWORD_SYSTEM_FAILED.message} ${existedSystemAdmin.email}`,
            )
            throw new HttpException(
                httpErrors.SYSTEM_ADMIN_INVALID_PASSWORD,
                HttpStatus.FORBIDDEN,
            )
        }
        const hashedNewPassword = await hashPassword(newPassword)
        existedSystemAdmin.password = hashedNewPassword
        await existedSystemAdmin.save()
        this.logger.info(
            `${messageLog.CHANGE_PASSWORD_SYSTEM_SUCCESS.message} ${existedSystemAdmin.email}`,
        )
        return 'Change Password successfully!!!'
    }

    async loginUserByPassword(
        loginByPassword: LoginUserByPassword,
    ): Promise<LoginResponseData> {
        const { taxOfCompany, email, password } = loginByPassword

        const company = await this.companyRepository.getCompanyByTaxCompany(
            taxOfCompany,
        )
        if (!company) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const user = await this.userRepository.findUserByEmailInCompany({
            email,
            companyId: company.id,
        })
        if (!user) {
            // this.logger.error('[DAPP] Login false. Please check (email or WallerAddress)',)
            throw new HttpException(
                httpErrors.USER_WRONG_LOGIN,
                HttpStatus.NOT_FOUND,
            )
        }

        const checkPassword = await comparePasswordUser(password, user.password)
        if (!checkPassword) {
            this.logger.info(
                `${messageLog.LOGIN_EMAIL_FAILED.message} ${email}`,
            )
            throw new HttpException(
                httpErrors.USER_INVALID_PASSWORD,
                HttpStatus.FORBIDDEN,
            )
        }

        if (user.userStatus.status !== UserStatusEnum.ACTIVE) {
            this.logger.info(
                `${messageLog.LOGIN_USER_INACTIVE.message} ${email}`,
            )
            throw new HttpException(
                httpErrors.USER_STATUS_INACTIVE,
                HttpStatus.FORBIDDEN,
            )
        }
        const { userData, accessToken, refreshToken } =
            await this.generateResponseLoginData(user)
        this.logger.info(
            `${messageLog.LOGIN_EMAIL_SUCCESS.message}` + userData.email,
        )
        return {
            userData,
            accessToken,
            refreshToken,
        }
    }

    async changeUserPassword(
        userId: number,
        ChangePasswordDto: ChangePasswordDto,
    ) {
        const { currentPassword, newPassword } = ChangePasswordDto
        const existedUser = await this.userRepository.findOne({
            where: {
                id: userId,
            },
        })
        if (!existedUser) {
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        //checkPassword
        const checkPassword = await comparePasswordUser(
            currentPassword,
            existedUser.password,
        )
        if (!checkPassword) {
            this.logger.info(
                `${messageLog.CHANGE_PASSWORD_FAILED.message} ${existedUser.email}`,
            )
            throw new HttpException(
                httpErrors.USER_INVALID_PASSWORD,
                HttpStatus.FORBIDDEN,
            )
        }

        const hashedNewPassword = await hashPasswordUser(newPassword)
        existedUser.password = hashedNewPassword
        await existedUser.save()
        this.logger.info(
            `${messageLog.CHANGE_PASSWORD_SUCCESS.message}` + existedUser.email,
        )
        return 'Change Password Successfully!!!!'
    }

    async sendEmailForgotPasswordUser(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto
        const existedUser = await this.userRepository.getActiveUserByEmail(
            email,
        )
        if (!existedUser) {
            // this.logger.error('[DAPP] User not found')
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        existedUser.resetPasswordToken = generateCryptoToken()
        existedUser.resetPasswordExpireTime = new Date(
            Date.now() + TOKEN_VERIFY_EMAIL_EXPIRE_IN_MILISECOND,
        )
        await existedUser.save()

        try {
            await this.emailService.sendEmailConfirmResetPasswordUser(
                existedUser,
            )
        } catch (error) {
            throw new HttpException(
                httpErrors.RESET_PASSWORD_TOKEN_SEND_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async verifyEmailAndResetPasswordUser(
        linkToken: string,
        resetPasswordDto: ResetPasswordDto,
    ): Promise<string> {
        const { password, confirmPassword } = resetPasswordDto
        const existedUser =
            await this.userRepository.getUserByResetPasswordTokenUser(linkToken)
        if (!existedUser) {
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        const currentTime = new Date()
        const expiredLinkToken = existedUser.resetPasswordExpireTime
        if (currentTime > expiredLinkToken) {
            this.logger.error(
                `${messageLog.RESET_PASSWORD_FAILED.code} ${messageLog.RESET_PASSWORD_FAILED.message} ${existedUser.email}`,
            )
            throw new HttpException(
                httpErrors.RESET_PASSWORD_TOKEN_EXPIRED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
        const newPasswordHashed = await hashPasswordUser(password)
        existedUser.password = newPasswordHashed
        await existedUser.save()
        this.logger.info(
            `${messageLog.RESET_PASSWORD_SUCCESS.message}` + existedUser.email,
        )
        return 'Reset Password Successfully'
    }
}
