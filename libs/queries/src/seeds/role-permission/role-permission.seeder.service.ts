import { Injectable, Logger } from '@nestjs/common'
import { RoleRepository } from '@repositories/role.repository'
import { PermissionRepository } from '@repositories/permission.repository'
import {
    InsertRolePermissionDto,
    rolePermissionData,
} from '@seeds/role-permission/data'
import { RolePermission } from '@entities/role-permission.entity'
import { RolePermissionRepository } from '@repositories/role-permission.repository'

@Injectable()
export class RolePermissionSeederService {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly permissionRepository: PermissionRepository,
        private readonly rolePermissionRepository: RolePermissionRepository,
    ) {}

    async saveOneRolePermission(
        rolePermisison: InsertRolePermissionDto,
    ): Promise<RolePermission> {
        const existedRolePermission =
            await this.rolePermissionRepository.findOne({
                where: {
                    roleId: rolePermisison.roleId,
                    permissionId: rolePermisison.permissionId,
                },
            })
        if (existedRolePermission) {
            Logger.error(
                `Duplicate role_permission with roleId and permissionId: ${existedRolePermission.roleId} ${existedRolePermission.permissionId} already exists`,
            )
            return
        }
        const createdRolePermission =
            await this.rolePermissionRepository.create(rolePermisison)
        await createdRolePermission.save()

        Logger.log(
            'role_permission_____inserted__role_permission_id: ' +
                createdRolePermission.id,
        )
        return createdRolePermission
    }

    async seedRolePermission() {
        const savePromises = rolePermissionData.map((rolePermission) =>
            this.saveOneRolePermission(rolePermission),
        )
        Logger.debug('role_permission______start__seeding__role_permission')
        await Promise.all(savePromises)
        Logger.log('role_permission______end__seeding__role_permission')
    }
}
