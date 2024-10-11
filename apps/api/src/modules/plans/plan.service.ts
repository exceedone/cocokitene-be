import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { CreatePlanDto, GetAllPlanDto, UpdatePlanDto } from '@dtos/plan.dto'
import { Pagination } from 'nestjs-typeorm-paginate'
import { Plan } from '@entities/plan.entity'
import { PlanRepository } from '@repositories/plan.repository'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { Logger } from 'winston'

@Injectable()
export class PlanService {
    constructor(
        private readonly planRepository: PlanRepository,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async getPlanCompany(planId: number): Promise<Plan> {
        const plan = await this.planRepository.findOne({
            where: {
                id: planId,
            },
        })
        return plan
    }

    async getAllPlans(getAllPlanDto: GetAllPlanDto): Promise<Pagination<Plan>> {
        const plans = await this.planRepository.getAllPlans(getAllPlanDto)
        return plans
    }

    async getPlanByPlanName(planName: string): Promise<Plan> {
        const plan = await this.planRepository.findOne({
            where: {
                planName: planName,
            },
        })
        return plan
    }

    async getPlanById(planId: number): Promise<Plan> {
        const plan = await this.planRepository.findOne({
            where: {
                id: planId,
            },
        })
        if (!plan) {
            throw new HttpException(
                httpErrors.PLAN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        return plan
    }

    async updatePlan(
        planId: number,
        updatePlanDto: UpdatePlanDto,
        systemAdminId: number,
    ): Promise<Plan> {
        let existedPlan = await this.getPlanById(planId)
        if (!existedPlan) {
            throw new HttpException(
                httpErrors.PLAN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const planExisted = await this.getPlanByPlanName(updatePlanDto.planName)
        if (planExisted && planExisted.planName !== existedPlan.planName) {
            throw new HttpException(
                httpErrors.DUPLICATE_PLAN_NAME,
                HttpStatus.BAD_REQUEST,
            )
        }

        try {
            existedPlan = await this.planRepository.updatePlan(
                planId,
                updatePlanDto,
                systemAdminId,
            )
            this.logger.info(
                `${messageLog.UPDATE_SERVICE_PLAN_SUCCESS.message} ${existedPlan.id}`,
            )
            return existedPlan
        } catch (error) {
            this.logger.error(
                `${messageLog.UPDATE_SERVICE_PLAN_FAILED.code} ${messageLog.UPDATE_SERVICE_PLAN_FAILED.message} ${planId}`,
            )
            throw new HttpException(
                {
                    code: httpErrors.PLAN_UPDATE_FAILED.code,
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async createPlan(
        createPlanDto: CreatePlanDto,
        systemAdminId: number,
    ): Promise<Plan> {
        try {
            const planExisted = await this.getPlanByPlanName(
                createPlanDto.planName,
            )
            if (planExisted) {
                this.logger.error(
                    `${messageLog.CREATE_SERVICE_PLAN_FAILED_DUPLICATE.code} ${messageLog.CREATE_SERVICE_PLAN_FAILED_DUPLICATE.message} ${createPlanDto.planName}`,
                )
                throw new HttpException(
                    httpErrors.DUPLICATE_PLAN_NAME,
                    HttpStatus.BAD_REQUEST,
                )
            }
            const createdPlan = await this.planRepository.createPlan(
                createPlanDto,
                systemAdminId,
            )
            this.logger.info(
                `${messageLog.CREATE_SERVICE_PLAN_SUCCESS.message} ${createdPlan.id}`,
            )
            return createdPlan
        } catch (error) {
            this.logger.error(
                `${messageLog.CREATE_SERVICE_PLAN_FAILED.code} ${messageLog.CREATE_SERVICE_PLAN_FAILED.message}`,
            )
            throw new HttpException(
                httpErrors.PLAN_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async countCompanyUseServicePlan(
        month: number,
        year: number,
    ): Promise<Pagination<Plan>> {
        const servicePlan = await this.planRepository.countCompanyUsePlan(
            month,
            year,
            {
                page: 1,
                limit: 100,
            },
        )

        return servicePlan
    }

    async getAllOptionServicePlan(): Promise<Plan[]> {
        const optionServicePlan =
            await this.planRepository.getAllOptionServicePlan()

        return optionServicePlan
    }

    async getServicePlanFreeTrial(): Promise<Plan> {
        const servicePlanFreeTrial = await this.planRepository.findOne({
            where: {
                price: 0,
            },
        })
        return servicePlanFreeTrial
    }
}
