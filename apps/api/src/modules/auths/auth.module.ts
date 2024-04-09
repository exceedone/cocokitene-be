import { Module } from '@nestjs/common'
import { AuthController } from '@api/modules/auths/auth.controller'
import { AuthService } from '@api/modules/auths/auth.service'
import { UserModule } from '@api/modules/users/user.module'
import { UserRoleModule } from '@api/modules/user-roles/user-role.module'
import { RoleModule } from '@api/modules/roles/role.module'
import { EmailModule } from '@api/modules/emails/email.module'

@Module({
    imports: [UserModule, RoleModule, UserRoleModule, EmailModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
