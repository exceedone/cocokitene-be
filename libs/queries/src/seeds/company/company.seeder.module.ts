import { TypeOrmExModule } from '@shares/modules'
import { CompanyStatusRepository } from '@repositories/company-status.repository'
import { CompanyRepository } from '@repositories/company.repository'
import { PlanRepository } from '@repositories/plan.repository'
import { Module } from '@nestjs/common'
import { CompanySeederService } from './company.seeder.service'

const repositories = TypeOrmExModule.forCustomRepository([
    CompanyRepository,
    CompanyStatusRepository,
    PlanRepository,
])

@Module({
    imports: [repositories],
    providers: [CompanySeederService],
    exports: [CompanySeederService],
})
export class CompanySeederModule {}
