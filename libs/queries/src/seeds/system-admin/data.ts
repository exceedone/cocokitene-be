import { PartialType } from '@nestjs/swagger'
import { SystemAdmin } from '../..'

export class InertSertSystemAdminDto extends PartialType(SystemAdmin) {}

// LeAnhVan --> $2b$10$Rl4P/bblPxAtTWT5VX.wqeB..Lr8a21YiqeW1B.6oGd4hWcwQlemO
// Exceedone@2024--> $2b$10$7OtV0XT3jR4S6eZ889WV3.HkRbHeZ8tBLLIU0eaIKYh42ZbzmygRW

export const systemAdminData: InertSertSystemAdminDto[] = [
    {
        username: 'vanla',
        email: 'vanla@trithucmoi.co',
        password:
            '$2b$10$Rl4P/bblPxAtTWT5VX.wqeB..Lr8a21YiqeW1B.6oGd4hWcwQlemO',
        resetPasswordToken: 'j2GBoY23PgLr8N1iDEz6',
        resetPasswordExpireTime: new Date('2023-12-31T23:59:59'),
    },
    {
        username: 'Snoro',
        email: 'snoro@exceedone.co.jp',
        password:
            '$2b$10$7OtV0XT3jR4S6eZ889WV3.HkRbHeZ8tBLLIU0eaIKYh42ZbzmygRW',
        resetPasswordToken: 'j2GBoY23PgLr8N1iDEz6',
        resetPasswordExpireTime: new Date('2023-12-31T23:59:59'),
    },
]
