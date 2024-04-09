import { Role } from '@entities/role.entity'
import { PartialType } from '@nestjs/mapped-types'

export class InsertRoleDto extends PartialType(Role) {}

export const roleData: InsertRoleDto[] = [
    {
        roleName: 'ADMIN',
        description:
            'admin role is the major permission of the system but still smaller than user_super_admin',
    },
    {
        roleName: 'SUPER_ADMIN',
        description:
            'super_admin role  is the largest permission of the system',
    },
    {
        roleName: 'SHAREHOLDER',
        description: 'shareholder role is shareholder of the system ',
    },
    {
        roleName: 'USER',
        description: 'User_normally role is normal user',
    },
]
