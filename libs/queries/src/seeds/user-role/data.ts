import { PartialType } from '@nestjs/mapped-types'
import { UserRole } from '@entities/user-role.entity'

export class InsertUserRoleDto extends PartialType(UserRole) {}
export const userRoleData: InsertUserRoleDto[] = [
    {
        userId: 1,
        roleId: 4,
    },
    {
        userId: 1,
        roleId: 1,
    },
    {
        userId: 1,
        roleId: 2,
    },
    {
        userId: 1,
        roleId: 3,
    },
]
