import { Role } from '@entities/role.entity'
import { PermissionEnum } from '@shares/constants/permission.const'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { GetAllInternalRoleDto, GetAllNormalRolesDto } from '@dtos/role.dto'
import { paginate, Pagination } from 'nestjs-typeorm-paginate'
import { RoleEnum } from '@shares/constants'
import { HttpException, HttpStatus } from '@nestjs/common'
import { httpErrors } from '@shares/exception-filter'

@CustomRepository(Role)
export class RoleRepository extends Repository<Role> {
    async getRoleByName(roleName: string): Promise<Role> {
        const role = await this.findOne({
            where: {
                roleName,
            },
        })
        return role
    }

    async getRoleById(roleId: number): Promise<Role> {
        const role = await this.findOne({
            where: {
                id: roleId,
            },
        })
        return role
    }

    async getPermissionsByRoleId(ids: number[]): Promise<string[]> {
        const permissionKeys: string[] = []
        for (const id of ids) {
            const role = await this.findOne({
                where: {
                    id: id,
                },
                relations: ['rolePermissions'],
            })
            if (role) {
                const permissionKeysAsString =
                    role?.rolePermissions?.map(
                        (rolePermission) =>
                            rolePermission?.permission?.key as PermissionEnum,
                    ) || []
                const permission_keys = permissionKeysAsString.map((key) =>
                    key.toString(),
                )
                permissionKeys.push(...permission_keys)
            }
        }
        return permissionKeys
    }

    async getAllNormalRoles(
        options: GetAllNormalRolesDto,
        companyId: number,
    ): Promise<Pagination<Role>> {
        const { page, limit, searchQuery } = options
        const queryBuilder = this.createQueryBuilder('roles')
            .select(['roles.id', 'roles.roleName', 'roles.description'])
            .where('roles.roleName != :role', {
                role: 'SUPER_ADMIN',
            })
            .andWhere('roles.companyId = :companyId', {
                companyId: companyId,
            })

        if (searchQuery) {
            queryBuilder.andWhere('(roles.roleName like :roleName)', {
                roleName: `%${searchQuery}%`,
            })
        }
        return paginate(queryBuilder, { page, limit })
    }

    async getAllInternalRoleInCompany(
        getAllInternalRoleDto: GetAllInternalRoleDto,
        companyId: number,
    ): Promise<Role[]> {
        const { searchQuery } = getAllInternalRoleDto
        const queryBuilder = this.createQueryBuilder('roles')
            .select(['roles.id', 'roles.roleName', 'roles.description'])
            .where('roles.companyId = :companyId', {
                companyId: companyId,
            })

        if (searchQuery) {
            queryBuilder.andWhere('roles.roleName like :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            })
        }

        const roles = await queryBuilder.getMany()
        return roles
    }

    async createCompanyRole(
        role: RoleEnum | string,
        companyId: number,
        description?: string,
    ): Promise<Role> {
        try {
            const createdCompanyRole = await this.create({
                roleName: role,
                companyId: companyId,
                description: description,
            })
            await createdCompanyRole.save()
            return createdCompanyRole
        } catch (error) {
            throw new HttpException(
                httpErrors.COMPANY_ROLE_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
