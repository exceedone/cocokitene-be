import { DatabaseModule } from '@database/database.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from '@shares/config/configuration'
import { PlanSeederModule } from './plan/plan.seeder.module'
import { CompanySeederModule } from './company/company.seeder.module'
import { CompanyStatusSeederModule } from './company-status/company-status.seeder.module'
import { Seeder } from './seeder'
import { PermissionSeederModule } from '@seeds/permission/permission.seeder.module'
import { RoleSeederModule } from '@seeds/role/role.seeder.module'
import { UserSeederModule } from '@seeds/user/user.seeder.module'
import { UserStatusSeederModule } from '@seeds/user-status/user-status.seeder.module'
import { RolePermissionSeederModule } from '@seeds/role-permission/role-permission.seeder.module'
import { UserRoleSeederModule } from '@seeds/user-role/user-role.seeder.module'
import { SystemAdminSeederModule } from '@seeds/system-admin/system-admin.seeder.module'
import { ElectionSeederModule } from '@seeds/election/election.seeder.module'
import { ReactionIconSeederModule } from '@seeds/reaction-icon/reaction-icon.seeder.module'
import { ChatPermissionSeederModule } from '@seeds/chat-permission/chat-permission.seeder.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        DatabaseModule,
        PlanSeederModule,
        CompanySeederModule,
        CompanyStatusSeederModule,
        PermissionSeederModule,
        RoleSeederModule,
        UserSeederModule,
        UserStatusSeederModule,
        RolePermissionSeederModule,
        UserRoleSeederModule,
        SystemAdminSeederModule,
        ElectionSeederModule,
        ReactionIconSeederModule,
        ChatPermissionSeederModule,
    ],
    providers: [Seeder],
})
export class SeederModule {}
