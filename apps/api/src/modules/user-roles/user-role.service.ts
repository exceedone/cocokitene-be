import { UserRole } from '@entities/user-role.entity'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserRoleRepository } from '@repositories/user-role.repository'
import { RoleService } from '@api/modules/roles/role.service'
import { CreateUserRoleDto } from '@dtos/user-role.dto'
import { httpErrors } from '@shares/exception-filter/http-errors.const'
import { RoleEnum } from '@shares/constants/role.const'
import { Role } from '@entities/role.entity'

@Injectable()
export class UserRoleService {
    constructor(
        private readonly userRoleRepository: UserRoleRepository,
        private readonly roleService: RoleService,
    ) {}
    async getRoleIdsByUserId(userId: number): Promise<number[]> {
        const roleIds = await this.userRoleRepository.getRoleIdsByUserId(userId)
        return roleIds
    }

    async getRolesByUserId(userId: number): Promise<Role[]> {
        const roles = await this.userRoleRepository.getRolesByUserId(userId)
        return roles
    }
    async createUserRole(
        createUserRoleDto: CreateUserRoleDto,
    ): Promise<UserRole> {
        const { userId, roleId } = createUserRoleDto
        try {
            const createdUserRole =
                await this.userRoleRepository.createUserRole({ userId, roleId })
            return createdUserRole
        } catch (error) {
            throw new HttpException(
                {
                    code: httpErrors.USER_ROLE_CREATE_FAILED.code,
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async updateUserRole(
        userId: number,
        newRoleIds: number[],
    ): Promise<number[]> {
        const currentRoles =
            await this.userRoleRepository.getListCurrentRoleIdOfUserId(userId)
        // ids just add from dto
        const rolesToAdds = newRoleIds.filter(
            (roleId) => !currentRoles.includes(roleId),
        )

        //ids need to delete when it not appear in newRoleIds
        const rolesToRemoves = currentRoles.filter(
            (rolesId) => !newRoleIds.includes(rolesId),
        )

        await Promise.all([
            ...rolesToRemoves.map((rolesToRemove) =>
                this.userRoleRepository.removeRole(rolesToRemove, userId),
            ),
            ...rolesToAdds.map((rolesToAdd) =>
                this.createUserRole({
                    userId: userId,
                    roleId: rolesToAdd,
                }),
            ),
        ])
        const roleIds = await this.getRoleIdsByUserId(userId)
        return roleIds
    }

    async getRoleByRoleNameAndIdCompany(roleName: RoleEnum, companyId: number) {
        const role = await this.roleService.getRoleByRoleNameAndIdCompany(
            roleName,
            companyId,
        )
        return role
    }
}
