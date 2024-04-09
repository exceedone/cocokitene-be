import { Injectable, Logger } from '@nestjs/common'
import { RoleRepository } from '@repositories/role.repository'
import { UserRepository } from '@repositories/user.repository'
import { UserRoleRepository } from '@repositories/user-role.repository'
import { InsertUserRoleDto, userRoleData } from '@seeds/user-role/data'
import { UserRole } from '@entities/user-role.entity'

@Injectable()
export class UserRoleSeederService {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly userRepository: UserRepository,
        private readonly userRoleRepository: UserRoleRepository,
    ) {}

    async saveOneUserRole(userRole: InsertUserRoleDto): Promise<UserRole> {
        const existedUserRole = await this.userRoleRepository.findOne({
            where: {
                userId: userRole.userId,
                roleId: userRole.roleId,
            },
        })
        if (existedUserRole) {
            Logger.error(
                `Duplicate user_role with roleId and userId: ${existedUserRole.roleId} ${existedUserRole.userId} already exists`,
            )
            return
        }
        const createdUserRole = await this.userRoleRepository.create(userRole)
        await createdUserRole.save()

        Logger.log(
            'role_permission_____inserted__role_permission_id: ' +
                createdUserRole.id,
        )
        return createdUserRole
    }

    async seedUserRole() {
        const savePromises = userRoleData.map((userRole) =>
            this.saveOneUserRole(userRole),
        )
        Logger.debug('user_role______start__seeding__user_role')
        await Promise.all(savePromises)
        Logger.log('user_role______end__seeding__user_role')
    }
}
