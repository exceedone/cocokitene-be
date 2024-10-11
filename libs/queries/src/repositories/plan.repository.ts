import { Plan } from '@entities/plan.entity'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { CreatePlanDto, GetAllPlanDto, UpdatePlanDto } from '@dtos/plan.dto'
import { paginate, paginateRaw, Pagination } from 'nestjs-typeorm-paginate'
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
        systemAdminId: number,
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
                    updatedSystemId: systemAdminId,
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

    async createPlan(
        createPlanDto: CreatePlanDto,
        systemAdminId: number,
    ): Promise<Plan> {
        const plan = await this.create({
            ...createPlanDto,
            createdSystemId: systemAdminId,
        })
        await plan.save()
        return plan
    }

    async countCompanyUsePlan(
        month: number,
        year: number,
        options: GetAllPlanDto,
    ): Promise<Pagination<Plan>> {
        const { page, limit } = options
        const queryBuilder = this.createQueryBuilder('plan_mst')
            .select(['plan_mst.id', 'plan_mst.planName'])
            .leftJoin(
                'company',
                'companies',
                `plan_mst.id = companies.planId AND MONTH(companies.createdAt) = ${month} AND YEAR(companies.createdAt) = ${year}`,
            )
            .addSelect(`COUNT(DISTINCT companies.id)`, 'totalCompany')
            .groupBy('plan_mst.id')

        return paginateRaw(queryBuilder, { page, limit })
    }

    async getAllOptionServicePlan(): Promise<Plan[]> {
        const listOption = await this.createQueryBuilder('plan_mst')
            .select(['plan_mst.id', 'plan_mst.planName', 'plan_mst.price'])
            .where('plan_mst.price > 0')
            .getMany()

        return listOption
    }
}
