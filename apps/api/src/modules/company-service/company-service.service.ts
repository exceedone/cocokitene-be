import { CompanyServicePlan } from '@entities/company-service.entity'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { httpErrors } from '@shares/exception-filter'
import { CompanyService } from '../companys/company.service'
import { CompanyServicePlanRepository } from '@repositories/company-service.repository'
import { ServiceSubscriptionService } from '../service-subscription/service-subscription.service'
import { SubscriptionServiceDto } from '@dtos/service-subscription.dto'
import { StatusSubscription } from '@shares/constants'
import {
    ServicePlanForCompanyDto,
    UpdateCreatedServicePlanForCompanyDto,
    UpdateServicePlanForCompanyDto,
} from '@dtos/company-service.dto'
import { PlanService } from '../plans/plan.service'
import { EmailService } from '../emails/email.service'
import { SystemAdminRepository } from '@repositories/system-admin.repository'

@Injectable()
export class ServicePlanOfCompanyService {
    constructor(
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
        private readonly companyServicePlanRepository: CompanyServicePlanRepository,
        @Inject(forwardRef(() => ServiceSubscriptionService))
        private readonly serviceSubscriptionService: ServiceSubscriptionService,
        private readonly servicePlan: PlanService,
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
        private readonly systemAdminRepository: SystemAdminRepository,
    ) {}

    async getServicePlanOfCompany(
        companyId: number,
    ): Promise<CompanyServicePlan> {
        const existedCompany = await this.companyService.getCompanyById(
            companyId,
        )
        if (!existedCompany) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const servicePlanOfCompany =
            await this.companyServicePlanRepository.getCompanyServicePlanByCompanyId(
                companyId,
            )

        return servicePlanOfCompany
    }

    async createServicePlanOfCompany(
        createServicePlanForCompanyDto: ServicePlanForCompanyDto,
        systemAdminId: number,
    ): Promise<CompanyServicePlan> {
        const createdServicePlanForCompany =
            await this.companyServicePlanRepository.createServicePlanForCompany(
                createServicePlanForCompanyDto,
                systemAdminId,
            )

        return createdServicePlanForCompany
    }

    async subscriptionServicePlanForCompany(
        subscriptionServicePlanDto: SubscriptionServiceDto,
    ) {
        const serviceSubscription =
            await this.serviceSubscriptionService.createServiceSubscription({
                ...subscriptionServicePlanDto,
                status: StatusSubscription.PENDING,
            })

        const currentServicePlanOfCompany = await this.getServicePlanOfCompany(
            serviceSubscription.companyId,
        )

        const servicePlanSubscription = await this.servicePlan.getPlanById(
            serviceSubscription.planId,
        )
        const systemAdmins =
            await this.systemAdminRepository.getAllSystemAdmin()

        const companyInfo = await this.companyService.getCompanyById(
            serviceSubscription.companyId,
        )

        await this.emailService.sendEmailToSystemNoticeSubscriptionService(
            systemAdmins,
            serviceSubscription.companyId,
            companyInfo.companyName,
            currentServicePlanOfCompany.plan.planName,
            servicePlanSubscription.planName,
            String(serviceSubscription.activationDate),
            String(serviceSubscription.expirationDate),
        )

        return serviceSubscription
    }

    async updateServicePlanForCompany(
        subscriptionServicePlanId: number,
        updateServicePlanForCompanyDto: UpdateServicePlanForCompanyDto,
    ) {
        const servicePlanOfCompanyByCompanyId =
            await this.getServicePlanOfCompany(
                updateServicePlanForCompanyDto.companyId,
            )

        if (!servicePlanOfCompanyByCompanyId) {
            throw new HttpException(
                httpErrors.SERVICE_PLAN_OF_COMPANY_NOT_POUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const getServicePlanSubscription = await this.servicePlan.getPlanById(
            updateServicePlanForCompanyDto.planId,
        )

        if (!getServicePlanSubscription) {
            throw new HttpException(
                httpErrors.PLAN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const servicePlanOfCompany =
            await this.companyServicePlanRepository.updateServicePlanOfCompany(
                servicePlanOfCompanyByCompanyId.id,
                {
                    ...updateServicePlanForCompanyDto,
                    meetingLimit: getServicePlanSubscription.maxMeeting,
                    accountLimit:
                        getServicePlanSubscription.maxShareholderAccount,
                    storageLimit: getServicePlanSubscription.maxStorage,
                },
            )

        // Update servicePlan id in company table
        await this.companyService.updateServicePlanForCompany(
            updateServicePlanForCompanyDto.companyId,
            updateServicePlanForCompanyDto.planId,
        )
        // Update Status Applied when apply service subscription for company
        await this.serviceSubscriptionService.updateStatusAppliedForSubscriptionService(
            subscriptionServicePlanId,
            StatusSubscription.APPLIED,
        )

        return servicePlanOfCompany
    }

    async updateCreatedOfServicePlanOfCompany(
        id: number,
        updateCreatedServicePlanForCompanyDto: UpdateCreatedServicePlanForCompanyDto,
    ): Promise<CompanyServicePlan> {
        const servicePlanOfCompany =
            await this.companyServicePlanRepository.updateCreatedOfServicePlanOfCompany(
                id,
                updateCreatedServicePlanForCompanyDto,
            )

        return servicePlanOfCompany
    }

    async getAllowUploadFile(companyId: number): Promise<boolean> {
        //Check limit service Plan
        const servicePlanOfCompany = await this.getServicePlanOfCompany(
            companyId,
        )

        const currentDate = new Date() // CurrentDate
        const expiredDate = new Date(servicePlanOfCompany.expirationDate)
        expiredDate.setDate(expiredDate.getDate() + 1)

        if (
            servicePlanOfCompany.storageUsed >=
                servicePlanOfCompany.storageLimit ||
            currentDate > expiredDate
        ) {
            return false
        }
        return true
    }

    async checkServiceExpired(companyId: number): Promise<boolean> {
        //Check limit service Plan
        const servicePlanOfCompany = await this.getServicePlanOfCompany(
            companyId,
        )

        const currentDate = new Date() // CurrentDate
        const expiredDate = new Date(servicePlanOfCompany.expirationDate)
        expiredDate.setDate(expiredDate.getDate() + 1)

        if (currentDate > expiredDate) {
            return true
        }
        return false
    }

    async updateStorageUsed(companyId: number, storageUsed: number) {
        const servicePlanOfCompany = await this.getServicePlanOfCompany(
            companyId,
        )

        const servicePlanCompanyById =
            await this.companyServicePlanRepository.updateCreatedOfServicePlanOfCompany(
                servicePlanOfCompany.id,
                {
                    companyId: servicePlanOfCompany.companyId,
                    meetingCreated: servicePlanOfCompany.meetingCreated,
                    accountCreated: servicePlanOfCompany.accountCreated,
                    storageUsed: servicePlanOfCompany.storageUsed + storageUsed,
                },
            )

        return servicePlanCompanyById
    }
}
