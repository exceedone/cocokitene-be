import { Role } from '@entities/role.entity'
import { RoleRepository } from '@repositories/role.repository'
import {
    CreateRoleDto,
    GetAllInternalRoleDto,
    GetAllNormalRolesDto,
} from '@dtos/role.dto'
import { Pagination } from 'nestjs-typeorm-paginate'
import { PermissionEnum, RoleEnum } from '@shares/constants'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { CompanyService } from '@api/modules/companys/company.service'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { RolePermissionService } from '@api/modules/role-permissions/role-permission.service'
import { Logger } from 'winston'
import { PermissionRepository } from '@repositories/permission.repository'
@Injectable()
export class RoleService {
    constructor(
        private readonly roleRepository: RoleRepository,
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
        @Inject(forwardRef(() => RolePermissionService))
        private readonly rolePermissionService: RolePermissionService,
        private readonly permissionRepository: PermissionRepository,

        @Inject('winston')
        private readonly logger: Logger,
    ) {}
    async getPermissionsByRoleId(roleIds: number[]): Promise<string[]> {
        const permissionKeys = await this.roleRepository.getPermissionsByRoleId(
            roleIds,
        )
        return permissionKeys
    }

    async getRoleByRoleNameAndIdCompany(
        roleName: string,
        companyId: number,
    ): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: {
                roleName: roleName,
                companyId: companyId,
            },
        })
        return role
    }

    // list role for screen new create account
    async getAllNormalRoles(
        getAllNormalRolesDto: GetAllNormalRolesDto,
        companyId: number,
    ): Promise<Pagination<Role>> {
        const roles = await this.roleRepository.getAllNormalRoles(
            getAllNormalRolesDto,
            companyId,
        )
        return roles
    }
    // list role for screen setting-role

    async getAllInternalRoleInCompany(
        getAllInternalRoleDto: GetAllInternalRoleDto,
        companyId: number,
    ): Promise<Role[]> {
        const roles = await this.roleRepository.getAllInternalRoleInCompany(
            getAllInternalRoleDto,
            companyId,
        )
        return roles
    }
    async createCompanyRole(
        role: RoleEnum | string,
        companyId: number,
        description?: string,
    ): Promise<Role> {
        try {
            const createdCompanyRole =
                await this.roleRepository.createCompanyRole(
                    role,
                    companyId,
                    description,
                )
            return createdCompanyRole
        } catch (error) {
            this.logger.error(
                `${messageLog.CREATE_ROLE_FAILED.code} ${messageLog.CREATE_ROLE_FAILED.message} ${role}`,
            )
            throw new HttpException(
                httpErrors.COMPANY_ROLE_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async createRoleHasPermissionInCompany(
        createRoleDto: CreateRoleDto,
    ): Promise<Role> {
        const { companyId, description, roleName, idPermissions } =
            createRoleDto
        const existedCompany = await this.companyService.getCompanyById(
            companyId,
        )
        if (!existedCompany) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const createdRole = await this.createCompanyRole(
            roleName,
            companyId,
            description,
        )

        //Hash permission Basic for created role
        const permissionBasic =
            await this.permissionRepository.getPermissionByPermissionName(
                PermissionEnum.BASIC_PERMISSION,
            )

        await this.rolePermissionService.createRolePermission({
            roleId: createdRole.id,
            permissionId: permissionBasic.id,
        }),
            await Promise.all([
                ...idPermissions.map((idPermission) =>
                    this.rolePermissionService.createRolePermission({
                        roleId: createdRole.id,
                        permissionId: idPermission,
                    }),
                ),
            ])
        this.logger.info(
            `${messageLog.CREATE_ROLE_SUCCESS.message} ${createdRole.roleName}`,
        )
        return createdRole
    }
}
