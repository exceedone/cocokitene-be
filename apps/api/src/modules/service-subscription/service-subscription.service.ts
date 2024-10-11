import {
    CreateServiceSubscriptionDto,
    GetAllServiceSubscription,
    UpdateServiceSubscriptionDto,
} from '@dtos/service-subscription.dto'
import { ServiceSubscription } from '@entities/service_subscription.entity'
import { Injectable } from '@nestjs/common'
import { ServiceSubscriptionRepository } from '@repositories/service-subscription.repository'
import { StatusSubscription } from '@shares/constants'
import { Pagination } from 'nestjs-typeorm-paginate'

@Injectable()
export class ServiceSubscriptionService {
    constructor(
        private readonly serviceSubscriptionRepository: ServiceSubscriptionRepository, // private readonly emailService: EmailService,
    ) {}

    async getAllServiceSubscription(
        getAllServiceSubscriptionDto: GetAllServiceSubscription,
    ): Promise<Pagination<ServiceSubscription>> {
        const serviceSubscription =
            await this.serviceSubscriptionRepository.getAllServiceSubscription(
                getAllServiceSubscriptionDto,
            )

        return serviceSubscription
    }

    async getAllServiceSubscriptionByCompanyId(
        getAllServiceSubscriptionDto: GetAllServiceSubscription,
        companyId: number,
    ): Promise<Pagination<ServiceSubscription>> {
        const serviceSubscriptionOfCompany =
            await this.serviceSubscriptionRepository.getAllServiceSubscriptionOfCompany(
                getAllServiceSubscriptionDto,
                companyId,
            )

        return serviceSubscriptionOfCompany
    }

    async createServiceSubscription(
        createServiceSubscriptionDto: CreateServiceSubscriptionDto,
        systemId?: number,
    ): Promise<ServiceSubscription> {
        const serviceSubscriptionCreated =
            await this.serviceSubscriptionRepository.createServiceSubscription(
                createServiceSubscriptionDto,
                systemId,
            )

        return serviceSubscriptionCreated
    }

    async getDetailServiceSubscriptionById(
        serviceSubscriptionId: number,
    ): Promise<ServiceSubscription> {
        const serviceSubScription =
            await this.serviceSubscriptionRepository.getServiceSubscriptionById(
                serviceSubscriptionId,
            )

        return serviceSubScription
    }

    async changeStatusServiceSubscription(
        id: number,
        status: StatusSubscription,
        systemAdminId: number,
    ) {
        const serviceSubScription =
            await this.serviceSubscriptionRepository.updateStatus(
                id,
                status,
                systemAdminId,
            )

        //Send Email to SupperAdmin notification request signup ServicePlan

        //

        return serviceSubScription
    }

    async updateServiceSubscription(
        id: number,
        updateServiceSubscriptionDto: UpdateServiceSubscriptionDto,
        systemAdminId: number,
        isChangeStatus: boolean,
    ): Promise<ServiceSubscription> {
        const serviceSubScription =
            await this.serviceSubscriptionRepository.updateServiceSubscription(
                id,
                updateServiceSubscriptionDto,
                systemAdminId,
                isChangeStatus,
            )

        return serviceSubScription
    }

    async getSubscriptionServicePlanById(id: number) {
        const serviceSubscription =
            await this.serviceSubscriptionRepository.getSubscriptionServicePlanById(
                id,
            )

        return serviceSubscription
    }

    async updateStatusAppliedForSubscriptionService(
        subscriptionServiceId: number,
        status: StatusSubscription,
    ) {
        const subscriptionService =
            await this.serviceSubscriptionRepository.updateStatusApplied(
                subscriptionServiceId,
                status,
            )

        return subscriptionService
    }
}
