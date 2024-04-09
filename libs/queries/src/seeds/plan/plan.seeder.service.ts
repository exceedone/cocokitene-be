import { Injectable, Logger } from '@nestjs/common'
import { PlanRepository } from '../../repositories/plan.repository'
import { InsertPlanDto, planData } from './data'
import { Plan } from '@entities/plan.entity'

@Injectable()
export class PlanSeederService {
    constructor(private readonly planRepository: PlanRepository) {}
    async saveOnePlan(plan: InsertPlanDto): Promise<Plan> {
        const existsPlan = await this.planRepository.findOne({
            where: {
                planName: plan.planName,
            },
        })
        if (existsPlan) {
            Logger.error(
                `Duplicate plan with planName: ${plan.planName} already exists`,
            )
            return
        }
        const createPlan = await this.planRepository.create(plan)
        await createPlan.save()
        Logger.log('plan________inserted__plan_id: ' + createPlan.id)
        return createPlan
    }

    async seedPlan() {
        const savePromises = planData.map((plan) => this.saveOnePlan(plan))
        Logger.debug('plan_init______start_seeding__plan_init')
        await Promise.all(savePromises)
        Logger.log('plan_init______end_seeding__plan_init')
    }
}
