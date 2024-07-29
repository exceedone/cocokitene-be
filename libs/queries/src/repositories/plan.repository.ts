import { Plan } from '@entities/plan.entity'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { CreatePlanDto, GetAllPlanDto, UpdatePlanDto } from '@dtos/plan.dto'
import { paginate, Pagination } from 'nestjs-typeorm-paginate'
import { HttpException, HttpStatus } from '@nestjs/common'
@CustomRepository(Plan)
export class PlanRepository extends Repository<Plan> {
    async getAllPlans(options: GetAllPlanDto): Promise<Pagination<Plan>> {
        const { page, limit, searchQuery, sortOrder } = options
        const queryBuilder = this.createQueryBuilder('plan_mst').select([
            'plan_mst.id',
            'plan_mst.planName',
            'plan_mst.description',
            'plan_mst.maxStorage',
            'plan_mst.maxMeeting',
            'plan_mst.price',
            'plan_mst.maxShareholderAccount',
        ])
        if (searchQuery) {
            queryBuilder.andWhere('plan_mst.planName like :planName', {
                planName: `%${searchQuery}%`,
            })
        }
        if (sortOrder) {
            queryBuilder.orderBy('plan_mst.updated_at', sortOrder)
        }
        return paginate(queryBuilder, { page, limit })
    }

    async updatePlan(
        planId: number,
        updatePlanDto: UpdatePlanDto,
    ): Promise<Plan> {
        try {
            await this.createQueryBuilder('plan_mst')
                .update(Plan)
                .set({
                    planName: updatePlanDto.planName,
                    description: updatePlanDto.description,
                    maxStorage: updatePlanDto.maxStorage,
                    maxMeeting: updatePlanDto.maxMeeting,
                    price: updatePlanDto.price,
                    maxShareholderAccount: updatePlanDto.maxShareholderAccount,
                })
                .where('plan_mst.id = :planId', { planId })
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
