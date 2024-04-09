import { Module } from '@nestjs/common'
import { PlanService } from '@api/modules/plans/plan.service'

@Module({
    providers: [PlanService],
    exports: [PlanService],
})
export class PlanModule {}
