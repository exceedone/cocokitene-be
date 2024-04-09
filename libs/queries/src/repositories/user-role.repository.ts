import { CustomRepository } from '@shares/decorators'
import { UserRole } from '@entities/user-role.entity'
import { Repository } from 'typeorm'
import { CreateUserRoleDto } from '@dtos/user-role.dto'
import { Role } from '@entities/role.entity'
@CustomRepository(UserRole)
export class UserRoleRepository extends Repository<UserRole> {
    async getRoleIdsByUserId(userId: number): Promise<number[]> {
        const userRoles = await this.createQueryBuilder('user_roles')
            .select(['user_roles.roleId'])
            .where('user_roles.userId = :userId', { userId })
            .getMany()
        const roleIds: number[] = userRoles.map((userRole) => userRole.roleId)
        return roleIds
    }

    async getRolesByUserId(userId: number): Promise<Role[]> {
        const userRoles = await this.createQueryBuilder('user_roles')
            .leftJoinAndSelect('user_roles.role', 'role')
            .where('user_roles.userId = :userId', { userId })
            .getMany()
        const roles = userRoles.map((userRole) => userRole.role)
        roles.sort((a, b) => a.roleName.localeCompare(b.roleName))
        return roles
    }
    async createUserRole(
        createUserRoleDto: CreateUserRoleDto,
    ): Promise<UserRole> {
        const { userId, roleId } = createUserRoleDto
        const createdUserRole = await this.create({
            userId,
            roleId,
        })
        return createdUserRole.save()
    }

    async removeRole(roleId: number, userId: number) {
        const existedUserRole = await this.findOne({
            where: {
                roleId: roleId,
                userId: userId,
            },
        })
        if (existedUserRole) {
            await this.remove(existedUserRole)
        }
    }

    async getListCurrentRoleIdOfUserId(userId: number): Promise<number[]> {
        const listUserRoles = await this.find({
            where: {
                userId: userId,
            },
        })
        const listIdRoleOfUser = listUserRoles.map(
            (listUserRole) => listUserRole.roleId,
        )
        return listIdRoleOfUser
    }
}
