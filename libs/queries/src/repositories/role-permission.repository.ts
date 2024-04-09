import { CustomRepository } from '@shares/decorators'
import { RolePermission } from '@entities/role-permission.entity'
import { Repository } from 'typeorm'
import { CreateRolePermissonDto } from '@dtos/role-permission.dto'

@CustomRepository(RolePermission)
export class RolePermissionRepository extends Repository<RolePermission> {
    async getListRoleIdByPermissionIdAndCompanyId(
        permissionId: number,
    ): Promise<number[]> {
        const listRolePermissions = await this.find({
            where: {
                permissionId: permissionId,
            },
        })
        const listRoleIds = listRolePermissions.map(
            (rolePermission) => rolePermission.roleId,
        )
        return listRoleIds
    }

    async createRolePermission(
        createRolePermissonDto: CreateRolePermissonDto,
    ): Promise<RolePermission> {
        const { roleId, permissionId } = createRolePermissonDto
        const createdRolePermission = await this.create({
            roleId,
            permissionId,
        })
        return await createdRolePermission.save()
    }

    async removeRolePermission(roleId: number, permissionId: number) {
        const existedRolePermission = await this.findOne({
            where: {
                roleId: roleId,
                permissionId: permissionId,
            },
        })
        if (existedRolePermission) {
            await this.remove(existedRolePermission)
        }
    }
}
