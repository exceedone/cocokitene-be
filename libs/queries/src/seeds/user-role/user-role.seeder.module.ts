import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { RoleRepository } from '@repositories/role.repository'
import { UserRepository } from '@repositories/user.repository'
import { UserRoleRepository } from '@repositories/user-role.repository'
import { UserRoleSeederService } from '@seeds/user-role/user-role.seeder.service'

const repositories = TypeOrmExModule.forCustomRepository([
    RoleRepository,
    UserRepository,
    UserRoleRepository,
])
@Module({
    imports: [repositories],
    providers: [UserRoleSeederService],
    exports: [UserRoleSeederService],
})
export class UserRoleSeederModule {}
