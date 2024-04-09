import { Module } from '@nestjs/common'
import { UserRoleService } from '@api/modules/user-roles/user-role.service'
import { RoleModule } from '@api/modules/roles/role.module'

@Module({
    imports: [RoleModule],
    providers: [UserRoleService],
    exports: [UserRoleService],
})
export class UserRoleModule {}
