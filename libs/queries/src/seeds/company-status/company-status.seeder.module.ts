import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { CompanyStatusRepository } from '../../repositories/company-status.repository'
import { CompanyStatusSeederService } from './company-status.seeder.service'

const repositories = TypeOrmExModule.forCustomRepository([
    CompanyStatusRepository,
])

@Module({
    imports: [repositories],
    providers: [CompanyStatusSeederService],
    exports: [CompanyStatusSeederService],
})
export class CompanyStatusSeederModule {}
