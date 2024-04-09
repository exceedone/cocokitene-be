import { Injectable, Logger } from '@nestjs/common'
import { PermissionRepository } from '@repositories/permission.repository'
import { InsertPermissionDto, permissionData } from '@seeds/permission/data'
import { Permission } from '@entities/permission.entity'

@Injectable()
export class PermissionSeederService {
    constructor(private readonly permissionRepository: PermissionRepository) {}

    async saveOnePermission(
        permission: InsertPermissionDto,
    ): Promise<Permission> {
        const existedPermission = await this.permissionRepository.findOne({
            where: {
                key: permission.key,
            },
        })
        if (existedPermission) {
            Logger.error(
                `Duplicate key with name_key: ${existedPermission.key} already exists`,
            )
            return
        }
        const createPermisson = await this.permissionRepository.create(
            permission,
        )
        await createPermisson.save()
        Logger.log(
            `permission_______inserted__permission_id: ` + createPermisson.id,
        )
        return createPermisson
    }

    async seedPermission() {
        const savePromises = permissionData.map((permission) =>
            this.saveOnePermission(permission),
        )
        Logger.debug('permission______start_seeding__permission')
        await Promise.all(savePromises)
        Logger.log('permission______end_seeding__permission')
    }
}
