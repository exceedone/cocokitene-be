import { CustomRepository } from '@shares/decorators'
import { Permission } from '@entities/permission.entity'
import { Repository } from 'typeorm'
import { GetAllPermissionDto } from '@dtos/permissions.dto'
import { PermissionEnum } from '@shares/constants'

@CustomRepository(Permission)
export class PermissionRepository extends Repository<Permission> {
    async getAllPermissions(
        options: GetAllPermissionDto,
    ): Promise<Permission[]> {
        const { searchQuery } = options
        const queryBuilder = this.createQueryBuilder('permissions').select([
            'permissions.id',
            'permissions.key',
            'permissions.description',
        ])
        if (searchQuery) {
            queryBuilder.andWhere('permissions.key like :key', {
                key: `%${searchQuery}%`,
            })
        }

        const permissions = await queryBuilder.getMany()
        return permissions
    }
    async getPermissionByPermissionName(
        permissionName: PermissionEnum,
    ): Promise<Permission> {
        const permission = await this.findOne({
            where: {
                key: permissionName,
            },
        })
        return permission
    }
}
