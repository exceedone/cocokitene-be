import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { RoleRepository } from '@repositories/role.repository'
import { RoleSeederService } from '@seeds/role/role.seeder.service'
import { CompanyRepository } from '@repositories/company.repository'

const repositories = TypeOrmExModule.forCustomRepository([
    RoleRepository,
    CompanyRepository,
])
@Module({
    imports: [repositories],
    providers: [RoleSeederService],
    exports: [RoleSeederService],
})
export class RoleSeederModule {}
