import { TypeOrmExModule } from '@shares/modules'
import { UserRepository } from '@repositories/user.repository'
import { CompanyRepository } from '@repositories/company.repository'
import { UserStatusRepository } from '@repositories/user-status.repository'
import { RoleRepository } from '@repositories/role.repository'
import { UserSeederService } from '@seeds/user/user.seeder.service'
import { Module } from '@nestjs/common'

const repositories = TypeOrmExModule.forCustomRepository([
    UserRepository,
    CompanyRepository,
    UserStatusRepository,
    RoleRepository,
])
@Module({
    imports: [repositories],
    providers: [UserSeederService],
    exports: [UserSeederService],
})
export class UserSeederModule {}
