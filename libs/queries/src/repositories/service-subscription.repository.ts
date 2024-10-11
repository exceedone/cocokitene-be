import {
    CreateServiceSubscriptionDto,
    GetAllServiceSubscription,
    UpdateServiceSubscriptionDto,
} from '@dtos/service-subscription.dto'
import { ServiceSubscription } from '@entities/service_subscription.entity'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Sort_By_Order, StatusSubscription } from '@shares/constants'
import { CustomRepository } from '@shares/decorators'
import { paginateRaw, Pagination } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'

@CustomRepository(ServiceSubscription)
export class ServiceSubscriptionRepository extends Repository<ServiceSubscription> {
    async getAllServiceSubscription(
        options: GetAllServiceSubscription,
    ): Promise<Pagination<ServiceSubscription>> {
        const { page, limit, searchQuery, sortOrder } = options

        const queryBuilder = this.createQueryBuilder('service_subscription')
            .select([
                'service_subscription.id',
                'service_subscription.company_id',
                'service_subscription.plan_id',
                'service_subscription.type',
                'service_subscription.amount',
                'service_subscription.payment_method',
                'service_subscription.status',
                'service_subscription.approval_time',
            ])
            .leftJoin(
                'plan_mst',
                'plan',
                'plan.id = service_subscription.plan_id',
            )
            .addSelect('plan.planName', 'planName')
            .leftJoin(
                'company',
                'company',
                'company.id = service_subscription.company_id',
            )
            .addSelect('company.companyName', 'companyName')

        if (searchQuery) {
            queryBuilder
                .andWhere('(company.companyName like :companyName)', {
                    companyName: `%${searchQuery}%`,
                })
                .orWhere('(plan.planName like :planName)', {
                    planName: `%${searchQuery}%`,
                })
        }
        if (sortOrder) {
            queryBuilder.orderBy('service_subscription.updated_at', sortOrder)
        }

        return paginateRaw(queryBuilder, { page, limit })
    }

    async getAllServiceSubscriptionOfCompany(
        options: GetAllServiceSubscription,
        companyId: number,
    ): Promise<Pagination<ServiceSubscription>> {
        const { page, limit } = options

        const queryBuilder = await this.createQueryBuilder(
            'service_subscription',
        )
            .select([
                'service_subscription.id',
                'service_subscription.company_id',
                'service_subscription.type',
                'service_subscription.amount',
                'service_subscription.payment_method',
                'service_subscription.status',
                'service_subscription.activation_date',
                'service_subscription.expiration_date',
                'service_subscription.approval_time',
            ])
            .where('service_subscription.company_id = :companyId', {
                companyId: companyId,
            })
            .leftJoin(
                'plan_mst',
                'plan',
                'plan.id = service_subscription.plan_id',
            )
            .addSelect('plan.planName', 'planName')
        queryBuilder.orderBy(
            'service_subscription.updated_at',
            Sort_By_Order.DESC,
        )

        return paginateRaw(queryBuilder, { page, limit })
    }

    async getAllServiceSubscriptionApply(): Promise<ServiceSubscription[]> {
        const currentDate = new Date()

        const queryBuilder = this.createQueryBuilder('service_subscription')
            .select([
                'service_subscription.id',
                'service_subscription.companyId',
                'service_subscription.planId',
                'service_subscription.type',
                'service_subscription.amount',
                'service_subscription.paymentMethod',
                'service_subscription.status',
                'service_subscription.activationDate',
                'service_subscription.expirationDate',
            ])
            .where('service_subscription.status= :status', {
                status: StatusSubscription.CONFIRMED,
            })

        queryBuilder.andWhere(
            'DATE_FORMAT(service_subscription.activation_date,"%Y-%m-%d 00:00:00") <= :currentDate',
            {
                currentDate: currentDate,
            },
        )

        const serviceSubscriptions = await queryBuilder.getMany()

        return serviceSubscriptions
    }

    async createServiceSubscription(
        createServiceSubscriptionDto: CreateServiceSubscriptionDto,
        systemId?: number,
    ): Promise<ServiceSubscription> {
        const serviceSubscription = await this.create({
            ...createServiceSubscriptionDto,
            createdSystemId: systemId,
        })
        await serviceSubscription.save()
        return serviceSubscription
    }

    async getServiceSubscriptionById(
        serviceSubscriptionId: number,
    ): Promise<ServiceSubscription> {
        const serviceSubscription = await this.findOne({
            where: {
                id: serviceSubscriptionId,
            },
            relations: ['plan', 'company'],
        })

        return serviceSubscription
    }

    async updateStatus(
        id: number,
        status: StatusSubscription,
        systemAdminId: number,
    ) {
        try {
            const currentTime = new Date()
            await this.createQueryBuilder('service_subscription')
                .update(ServiceSubscription)
                .set({
                    status: status,
                    updatedSystemId: systemAdminId,
                    approvalTime: currentTime,
                })
                .where('service_subscription.id = :id', { id: id })
                .execute()

            const serviceSubscription = await this.findOne({
                where: {
                    id: id,
                },
            })

            return serviceSubscription
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async updateServiceSubscription(
        id: number,
        updateServiceSubscriptionDto: UpdateServiceSubscriptionDto,
        systemAdminId: number,
        isChangeStatus?: boolean,
    ): Promise<ServiceSubscription> {
        try {
            await this.createQueryBuilder('service_subscription')
                .update(ServiceSubscription)
                .set({
                    companyId: updateServiceSubscriptionDto.companyId,
                    planId: updateServiceSubscriptionDto.planId,
                    type: updateServiceSubscriptionDto.type,
                    amount: updateServiceSubscriptionDto.amount,
                    paymentMethod: updateServiceSubscriptionDto.paymentMethod,
                    activationDate: updateServiceSubscriptionDto.activationDate,
                    expirationDate: updateServiceSubscriptionDto.expirationDate,
                    status: updateServiceSubscriptionDto.status,
                    updatedSystemId: systemAdminId,
                })
                .where('service_subscription.id = :id', { id: id })
                .execute()

            if (isChangeStatus) {
                const currentTime = new Date()
                await this.createQueryBuilder('service_subscription')
                    .update(ServiceSubscription)
                    .set({
                        approvalTime: currentTime,
                    })
                    .where('service_subscription.id = :id', { id: id })
                    .execute()
            }

            const serviceSubscription = await this.findOne({
                where: {
                    id: id,
                },
            })

            return serviceSubscription
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async updateStatusApplied(id: number, status: StatusSubscription) {
        try {
            await this.createQueryBuilder('service_subscription')
                .update(ServiceSubscription)
                .set({
                    status: status,
                })
                .where('service_subscription.id = :id', { id: id })
                .execute()

            const serviceSubscription = await this.findOne({
                where: {
                    id: id,
                },
            })

            return serviceSubscription
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getSubscriptionServicePlanById(
        id: number,
    ): Promise<ServiceSubscription> {
        const serviceSubscription = await this.findOne({
            where: {
                id: id,
            },
        })

        return serviceSubscription
    }

    async getSubscriptionOfCompanyExtend(
        companyId: number,
        expiredDateOfCurrentService: string,
    ): Promise<ServiceSubscription[]> {
        const expiredTimeOfCurrentService = new Date(
            expiredDateOfCurrentService,
        )

        const queryBuilder = await this.createQueryBuilder(
            'service_subscription',
        )
            .select([
                'service_subscription.id',
                'service_subscription.companyId',
                'service_subscription.planId',
                'service_subscription.type',
                'service_subscription.paymentMethod',
                'service_subscription.activationDate',
                'service_subscription.expirationDate',
                'service_subscription.status',
            ])
            // .where('service_subscription.companyId = :companyId', {
            //     companyId: 0,
            // })
            .where('service_subscription.companyId = :id', {
                id: companyId,
            })
            .andWhere(
                '(service_subscription.status= :statusConfirmed OR service_subscription.status= :statusPending)',
                {
                    statusConfirmed: StatusSubscription.CONFIRMED,
                    statusPending: StatusSubscription.PENDING,
                },
            )
            .andWhere(
                'DATE_FORMAT(service_subscription.activation_date,"%Y-%m-%d 00:00:00") >= :currentDate',
                {
                    currentDate: expiredTimeOfCurrentService,
                },
            )

        return queryBuilder.getMany()
    }
}
