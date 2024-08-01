import { Company } from '@entities/company.entity'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { CompanyRepository } from '@repositories/company.repository'
import { Pagination } from 'nestjs-typeorm-paginate'
import {
    CreateCompanyDto,
    GetAllCompanyDto,
    UpdateCompanyDto,
} from '@dtos/company.dto'
import { CompanyStatusRepository } from '@repositories/company-status.repository'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { UserService } from '@api/modules/users/user.service'
import { RoleService } from '@api/modules/roles/role.service'
import { enumToArray } from '@shares/utils/enum'
import { PermissionEnum, RoleEnum, RoleMtgEnum } from '@shares/constants'
import { UserRoleService } from '@api/modules/user-roles/user-role.service'
import { UserStatusService } from '@api/modules/user-status/user-status.service'
import { PlanService } from '@api/modules/plans/plan.service'
import { User } from '@entities/user.entity'
import { PermissionService } from '@api/modules/permissions/permission.service'
import { RolePermissionService } from '@api/modules/role-permissions/role-permission.service'
import { EmailService } from '@api/modules/emails/email.service'
import {
    createRandomPassword,
    generateRandomHexColor,
    hashPasswordUser,
} from '@shares/utils'
import { uuid } from '@shares/utils/uuid'
import { Logger } from 'winston'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'

@Injectable()
export class CompanyService {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyStatusRepository: CompanyStatusRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly roleService: RoleService,
        private readonly userRoleService: UserRoleService,
        private readonly userStatusService: UserStatusService,
        private readonly planService: PlanService,
        @Inject(forwardRef(() => PermissionService))
        private readonly permissionService: PermissionService,
        private readonly rolePermissionService: RolePermissionService,
        private readonly emailService: EmailService,
        private readonly roleMtgService: RoleMtgService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}
    async getAllCompanys(
        getAllCompanyDto: GetAllCompanyDto,
    ): Promise<Pagination<Company>> {
        const companys = await this.companyRepository.getAllCompanys(
            getAllCompanyDto,
        )
        return companys
    }

    async getCompanyById(companyId: number): Promise<Company> {
        const company = await this.companyRepository.findOne({
            where: {
                id: companyId,
            },
            relations: ['companyStatus'],
        })
        return company
    }

    async updateCompany(
        companyId: number,
        updateCompanyDto: UpdateCompanyDto,
    ): Promise<Company> {
        let existedCompany = await this.getCompanyById(companyId)
        if (!existedCompany) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        let existedCompany1 =
            await this.companyRepository.getCompanyByTaxCompany(
                updateCompanyDto.taxNumber,
            )
        if (
            existedCompany1 &&
            existedCompany1.taxNumber !== existedCompany.taxNumber
        ) {
            throw new HttpException(
                httpErrors.DUPLICATE_TAX_NUMBER_COMPANY,
                HttpStatus.BAD_REQUEST,
            )
        }
        existedCompany1 = await this.companyRepository.getCompanyByEmail(
            updateCompanyDto.email,
        )
        if (existedCompany1 && existedCompany1.email !== existedCompany.email) {
            throw new HttpException(
                httpErrors.DUPLICATE_EMAIL_COMPANY,
                HttpStatus.BAD_REQUEST,
            )
        }

        try {
            existedCompany = await this.companyRepository.updateCompany(
                companyId,
                updateCompanyDto,
            )
            this.logger.info(
                `${messageLog.UPDATE_COMPANY_SUCCESS.message} ${existedCompany.id}`,
            )
        } catch (error) {
            this.logger.error(
                `${messageLog.UPDATE_COMPANY_FAILED.code} ${messageLog.UPDATE_COMPANY_FAILED.message} ${existedCompany.id}`,
            )
            throw new HttpException(
                {
                    code: httpErrors.COMPANY_UPDATE_FAILED.code,
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
        return existedCompany
    }

    async createCompany(createCompanyDto: CreateCompanyDto): Promise<Company> {
        // check email and wallet address existed super admin
        const superAdminEmail = createCompanyDto.superAdminCompany.email
        const superAdminWalletAddress =
            createCompanyDto.superAdminCompany.walletAddress

        let superAdmin: User
        if (superAdminWalletAddress) {
            superAdmin = await this.userService.getUserByWalletAddress(
                superAdminWalletAddress,
            )
            if (superAdmin) {
                this.logger.error(
                    `${messageLog.CREATE_COMPANY_FAILED_DUPLICATE.code} ${messageLog.CREATE_COMPANY_FAILED_DUPLICATE.message} ${superAdminWalletAddress}`,
                )
                throw new HttpException(
                    httpErrors.DUPLICATE_WALLET_ADDRESS,
                    HttpStatus.BAD_REQUEST,
                )
            }
        }
        superAdmin = await this.userService.getUserByEmail(superAdminEmail)
        if (superAdmin) {
            this.logger.error(
                `${messageLog.CREATE_COMPANY_FAILED_DUPLICATE.code} ${messageLog.CREATE_COMPANY_FAILED_DUPLICATE.message} ${superAdminEmail}`,
            )
            throw new HttpException(
                httpErrors.DUPLICATE_EMAIL_USER,
                HttpStatus.BAD_REQUEST,
            )
        }

        //create company
        let createdCompany: Company

        let company: Company
        company = await this.companyRepository.getCompanyByTaxCompany(
            createCompanyDto.taxNumber,
        )
        if (company) {
            this.logger.error(
                `${messageLog.CREATE_COMPANY_FAILED_DUPLICATE.code} ${messageLog.CREATE_COMPANY_FAILED_DUPLICATE.message} ${createCompanyDto.taxNumber}`,
            )
            throw new HttpException(
                httpErrors.DUPLICATE_TAX_NUMBER_COMPANY,
                HttpStatus.BAD_REQUEST,
            )
        }
        company = await this.companyRepository.getCompanyByEmail(
            createCompanyDto.email,
        )
        if (company) {
            this.logger.error(
                `${messageLog.CREATE_COMPANY_FAILED_DUPLICATE.code} ${messageLog.CREATE_COMPANY_FAILED_DUPLICATE.message} ${createCompanyDto.email}`,
            )
            throw new HttpException(
                httpErrors.DUPLICATE_EMAIL_COMPANY,
                HttpStatus.BAD_REQUEST,
            )
        }

        try {
            createdCompany = await this.companyRepository.createCompany(
                createCompanyDto,
            )
            this.logger.info(
                `${messageLog.CREATE_COMPANY_SUCCESS.message} ${createdCompany.id}`,
            )
        } catch (error) {
            this.logger.error(
                `${messageLog.CREATE_COMPANY_FAILED.code} ${messageLog.CREATE_COMPANY_FAILED.message}`,
            )
            throw new HttpException(
                httpErrors.COMPANY_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
        const { superAdminCompany } = createCompanyDto

        let defaultPassword = ''

        const createdSuperAdminCompany =
            await this.userService.createSuperAdminCompany({
                username: superAdminCompany.username,
                email: superAdminCompany.email,
                walletAddress: superAdminCompany.walletAddress || null,
                statusId: superAdminCompany.statusId,
                companyId: createdCompany.id,
            })
        defaultPassword = createRandomPassword(8)
        const hashedDefaultPassword = await hashPasswordUser(defaultPassword)

        createdSuperAdminCompany.password = hashedDefaultPassword
        createdSuperAdminCompany.nonce = uuid()
        createdSuperAdminCompany.defaultAvatarHashColor =
            generateRandomHexColor()
        await createdSuperAdminCompany.save()
        await Promise.all([
            ...enumToArray(RoleEnum).map((role) =>
                this.roleService.createCompanyRole(role, createdCompany.id),
            ),
            ...enumToArray(RoleMtgEnum).map((role) =>
                this.roleMtgService.createCompanyRoleMtg(
                    role,
                    createdCompany.id,
                ),
            ),
        ])
        const [
            roleSuperAdminOfCompany,
            roleAdminOfCompany,
            roleShareholderOfCompany,
            roleUserOfCompany,
            roleBoardOfCompany,
            listPermissions,
            listPermissionsBase,
            listPermissionsBaseForRoleBoard,
            listPermissionsBaseForRoleShareholder,
        ] = await Promise.all([
            this.roleService.getRoleByRoleNameAndIdCompany(
                RoleEnum.SUPER_ADMIN,
                createdCompany.id,
            ),
            this.roleService.getRoleByRoleNameAndIdCompany(
                RoleEnum.ADMIN,
                createdCompany.id,
            ),
            this.roleService.getRoleByRoleNameAndIdCompany(
                RoleEnum.SHAREHOLDER,
                createdCompany.id,
            ),
            this.roleService.getRoleByRoleNameAndIdCompany(
                RoleEnum.USER,
                createdCompany.id,
            ),
            this.roleService.getRoleByRoleNameAndIdCompany(
                RoleEnum.BOARD,
                createdCompany.id,
            ),
            this.permissionService.getAllInternalPermissions({
                searchQuery: '',
            }),
            this.permissionService.getAllPermissionsBase(),
            this.permissionService.getPermissionsBaseForRoleBoard(),
            this.permissionService.getPermissionsBaseForRoleShareholder(),
        ])

        await Promise.all([
            [
                roleBoardOfCompany,
                roleShareholderOfCompany,
                roleUserOfCompany,
            ].map(async (role) => {
                await Promise.all([
                    ...listPermissionsBase.map((permission) =>
                        this.rolePermissionService.createRolePermission({
                            permissionId: permission.id,
                            roleId: role.id,
                        }),
                    ),
                ])
            }),

            ...listPermissionsBaseForRoleBoard.map((permission) => {
                this.rolePermissionService.createRolePermission({
                    permissionId: permission.id,
                    roleId: roleBoardOfCompany.id,
                })
            }),

            ...listPermissionsBaseForRoleShareholder.map((permission) => {
                this.rolePermissionService.createRolePermission({
                    permissionId: permission.id,
                    roleId: roleShareholderOfCompany.id,
                })
            }),
        ])
        await Promise.all([
            //Seed permission for Super Admin
            ...listPermissions.map((permission) =>
                this.rolePermissionService.createRolePermission({
                    permissionId: permission.id,
                    roleId: roleSuperAdminOfCompany.id,
                }),
            ),
            //Seed permission for Admin Role
            ...listPermissions.map((permission) => {
                if (
                    permission.key !==
                    PermissionEnum.SETTING_PERMISSION_FOR_ROLES
                ) {
                    this.rolePermissionService.createRolePermission({
                        permissionId: permission.id,
                        roleId: roleAdminOfCompany.id,
                    })
                }
            }),
        ])

        await this.userRoleService.createUserRole({
            userId: createdSuperAdminCompany.id,
            roleId: roleSuperAdminOfCompany.id,
        })

        try {
            await this.emailService.sendEmailWhenCreatedCompanySuccesfully(
                createdSuperAdminCompany,
                createdCompany,
                defaultPassword,
            )
        } catch (error) {
            // this.logger.error(
            //     `[DAPP] Send information of super admin to super admin failed. Please try again with companyId: ` +
            //         createdCompany.id,
            // )
            throw new HttpException(
                httpErrors.EMAIL_SEND_INFORMATION_TO_SUPER_ADMIN_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        return createdCompany
    }
}
