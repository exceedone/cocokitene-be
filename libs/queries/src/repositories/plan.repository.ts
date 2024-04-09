import { Plan } from '@entities/plan.entity'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { CreatePlanDto, GetAllPlanDto, UpdatePlanDto } from '@dtos/plan.dto'
import { paginate, Pagination } from 'nestjs-typeorm-paginate'
import { HttpException, HttpStatus } from '@nestjs/common'
@CustomRepository(Plan)
export class PlanRepository extends Repository<Plan> {
    async getAllPlans(options: GetAllPlanDto): Promise<Pagination<Plan>> {
        const { page, limit, searchQuery } = options
        const queryBuilder = this.createQueryBuilder('plans').select([
            'plans.id',
            'plans.planName',
            'plans.description',
            'plans.maxStorage',
            'plans.maxMeeting',
            'plans.price',
            'plans.maxShareholderAccount',
        ])
        if (searchQuery) {
            queryBuilder.andWhere('plans.planName like :planName', {
                planName: `%${searchQuery}%`,
            })
        }
        return paginate(queryBuilder, { page, limit })
    }

    async updatePlan(
        planId: number,
        updatePlanDto: UpdatePlanDto,
    ): Promise<Plan> {
        try {
            await this.createQueryBuilder('plans')
                .update(Plan)
                .set({
                    planName: updatePlanDto.planName,
                    description: updatePlanDto.description,
                    maxStorage: updatePlanDto.maxStorage,
                    maxMeeting: updatePlanDto.maxMeeting,
                    price: updatePlanDto.price,
                    maxShareholderAccount: updatePlanDto.maxShareholderAccount,
                })
                .where('plans.id = :planId', { planId })
                .execute()

            const plan = await this.findOne({
                where: {
                    id: planId,
                },
            })
            return plan
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async createPlan(createPlanDto: CreatePlanDto): Promise<Plan> {
        const plan = await this.create({
            ...createPlanDto,
        })
        await plan.save()
        return plan
    }
}
