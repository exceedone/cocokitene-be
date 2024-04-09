import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthService } from '@api/modules/auths/auth.service'
import {
    ForgotPasswordDto,
    LoginByPassword,
    LoginDto,
    LoginUserByPassword,
    RefreshTokenDto,
    SystemAdminRefreshTokenDto,
} from 'libs/queries/src/dtos/auth.dto'
import { ResetPasswordDto } from '@dtos/password.dto'
import { ChangePasswordDto } from '@dtos/system-admin.dto'
import { SystemAdminGuard } from '@shares/guards/systemadmin.guard'
import { SystemAdminScope } from '@shares/decorators/system-admin.decorator'
import { SystemAdmin } from '@entities/system-admin.entity'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@sentry/node'

@Controller('auths')
@ApiTags('auths')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const loginData = await this.authService.login(loginDto)
        return loginData
    }

    //LoginUser By Email-Password
    @Post('login-by-password')
    @HttpCode(HttpStatus.OK)
    async loginUserByPassword(@Body() loginByPassword: LoginUserByPassword) {
        const loginData = await this.authService.loginUserByPassword(
            loginByPassword,
        )
        return loginData
    }

    //start system admin
    @Post('/system-admin/login-by-password')
    @HttpCode(HttpStatus.OK)
    async loginByPassword(@Body() loginByPassword: LoginByPassword) {
        const loginByPasswordData = await this.authService.loginByPassword(
            loginByPassword,
        )
        return loginByPasswordData
    }
    //refresh token user
    @Post('/user/refresh-token')
    @HttpCode(HttpStatus.CREATED)
    async generateNewAccessJWT(@Body() refreshTokenDto: RefreshTokenDto) {
        const newAccessToken = await this.authService.generateNewAccessJWT(
            refreshTokenDto,
        )
        return newAccessToken
    }

    @Post('/system-admin/refresh-token')
    @HttpCode(HttpStatus.CREATED)
    async generateNewAccessJWTSystemAdmin(
        @Body() systemAdminRefreshTokenDto: SystemAdminRefreshTokenDto,
    ) {
        const newAccessTokenSystemAdmin =
            await this.authService.generateNewAccessJWTSystemAdmin(
                systemAdminRefreshTokenDto,
            )
        return newAccessTokenSystemAdmin
    }

    @Post('/system-admin/forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async sendEmailForgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ) {
        await this.authService.sendEmailForgotPassword(forgotPasswordDto)
        return 'Send reset password token to your email successfully!!!'
    }

    @Post('/system-admin/email/verify/:token')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async verifyEmailAndResetPassword(
        @Param('token') linkToken: string,
        @Body() resetPasswordDto: ResetPasswordDto,
    ) {
        const isEmailVerify =
            await this.authService.verifyEmailAndResetPassword(
                linkToken,
                resetPasswordDto,
            )
        return isEmailVerify
    }

    @Post('system-admin/reset-password')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @SystemAdminScope() systemAdmin: SystemAdmin,
    ) {
        const systemAdminId = systemAdmin?.id
        const changePassword = await this.authService.changePassword(
            systemAdminId,
            changePasswordDto,
        )
        return changePassword
    }

    @Post('/user/change-password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @Permission(PermissionEnum.EDIT_PROFILE)
    async createUser(
        @Body() changePasswordDto: ChangePasswordDto,
        @UserScope() user: User,
    ) {
        const userId = +user?.id
        const changeUserPassword = await this.authService.changeUserPassword(
            userId,
            changePasswordDto,
        )
        return changeUserPassword
    }

    @Post('/user/forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async sendEmailForgotPasswordUser(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ) {
        await this.authService.sendEmailForgotPasswordUser(forgotPasswordDto)
        return 'Send reset password token to your email successfully!!!'
    }

    @Post('/user/email/verify/:token')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async verifyEmailAndResetPasswordUser(
        @Param('token') linkToken: string,
        @Body() resetPasswordDto: ResetPasswordDto,
    ) {
        const isEmailVerify =
            await this.authService.verifyEmailAndResetPasswordUser(
                linkToken,
                resetPasswordDto,
            )
        return isEmailVerify
    }
}
