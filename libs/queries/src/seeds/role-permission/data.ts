import { PartialType } from '@nestjs/mapped-types'
import { RolePermission } from '@entities/role-permission.entity'

export class InsertRolePermissionDto extends PartialType(RolePermission) {}

export const rolePermissionData: InsertRolePermissionDto[] = [
    {
        permissionId: 1,
        roleId: 4,
    },
    {
        permissionId: 5,
        roleId: 1,
    },
    {
        permissionId: 3,
        roleId: 4,
    },
    {
        permissionId: 4,
        roleId: 4,
    },
]
