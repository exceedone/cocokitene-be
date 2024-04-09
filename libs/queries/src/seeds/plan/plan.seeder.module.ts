import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { PlanSeederService } from './plan.seeder.service'
import { PlanRepository } from '@repositories/plan.repository'
const repositories = TypeOrmExModule.forCustomRepository([PlanRepository])

@Module({
    imports: [repositories],
    providers: [PlanSeederService],
    exports: [PlanSeederService],
})
export class PlanSeederModule {}
