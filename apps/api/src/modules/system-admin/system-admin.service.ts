import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import {
    CreateCompanyDto,
    GetAllCompanyDto,
    GetAllCompanyStatusDto,
    UpdateCompanyDto,
} from '@dtos/company.dto'
import { CompanyService } from '@api/modules/companys/company.service'
import { UserService } from '../users/user.service'
import { DetailCompanyResponse } from '../companys/company.interface'
import { Company } from '@entities/company.entity'
import { httpErrors } from '@shares/exception-filter'
import { SuperAdminDto } from '@dtos/user.dto'
import { User } from '@sentry/node'
import { CreatePlanDto, GetAllPlanDto, UpdatePlanDto } from '@dtos/plan.dto'
import { PlanService } from '@api/modules/plans/plan.service'
import { CompanyStatusService } from '@api/modules/company-status/company-status.service'
import { RoleService } from '@api/modules/roles/role.service'
import { GetAllUserStatusDto } from '@dtos/user-status.dto'
import { UserStatusService } from '@api/modules/user-status/user-status.service'
import { SystemAdminRepository } from '@repositories/system-admin.repository'
import { Plan } from '@entities/plan.entity'
import { SystemAdmin } from '@entities/system-admin.entity'
import { Logger } from 'winston'
import { SystemNotification } from '@entities/system-notification.entity'
import {
    createSystemNotificationDto,
    getAllSysNotificationDto,
    updateSystemNotificationDto,
} from '@dtos/system-notification.dto'
import { SystemNotificationService } from '../system-notification/system-notification.service'
import { Pagination } from 'nestjs-typeorm-paginate'
import {
    CreateServiceSubscriptionDto,
    GetAllServiceSubscription,
    UpdateServiceSubscriptionDto,
} from '@dtos/service-subscription.dto'
import { ServiceSubscription } from '@entities/service_subscription.entity'
import { ServiceSubscriptionService } from '../service-subscription/service-subscription.service'
import { StatusSubscription } from '@shares/constants'
import { ServicePlanOfCompanyService } from '../company-service/company-service.service'
import { CompanyServicePlan } from '@entities/company-service.entity'
import { EmailService } from '../emails/email.service'

@Injectable()
export class SystemAdminService {
    constructor(
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly planService: PlanService,
        private readonly companyStatusService: CompanyStatusService,
        private readonly roleService: RoleService,
        private readonly userStatusService: UserStatusService,
        private readonly systemAdminRepository: SystemAdminRepository,
        private readonly systemNotificationService: SystemNotificationService,
        private readonly serviceSubscriptionService: ServiceSubscriptionService,
        @Inject(forwardRef(() => ServicePlanOfCompanyService))
        private readonly servicePlanOfCompanyService: ServicePlanOfCompanyService,
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,

        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async getAllCompanys(getAllCompanyDto: GetAllCompanyDto) {
        const companys = await this.companyService.getAllCompanys(
            getAllCompanyDto,
        )
        return companys
    }

    async getCompanyById(companyId: number): Promise<DetailCompanyResponse> {
        const existedCompany = await this.companyService.getCompanyById(
            companyId,
        )
        // this.logger.info(
        //     '[DAPP] get company successfully with companyId: ' +
        //         existedCompany.id,
        // )

        const [superAdmin, plan] = await Promise.all([
            this.userService.getSuperAdminCompany(existedCompany.id),
            this.planService.getPlanCompany(existedCompany.planId),
        ])

        return {
            ...existedCompany,
            superAdminInfo: superAdmin,
            servicePlan: plan,
        }
    }

    async updateCompany(
        companyId: number,
        updateCompanyDto: UpdateCompanyDto,
        systemAdminId: number,
    ): Promise<Company> {
        const updatedCompany = await this.companyService.updateCompany(
            companyId,
            updateCompanyDto,
            systemAdminId,
        )
        return updatedCompany
    }

    async updateSuperAdminCompany(
        companyId: number,
        superAdminCompanyId: number,
        superAdminDto: SuperAdminDto,
    ): Promise<User> {
        const superAdmin = await this.userService.getInternalUserById(
            superAdminCompanyId,
        )

        if (!superAdmin) {
            throw new HttpException(
                httpErrors.SUPER_ADMIN_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
            )
        }

        if (superAdmin.companyId !== companyId) {
            throw new HttpException(
                httpErrors.SUPER_ADMIN_NOT_IN_THIS_COMPANY,
                HttpStatus.BAD_REQUEST,
            )
        }

        let superAdminExited: User
        if (superAdminDto.walletAddress) {
            superAdminExited =
                await this.userService.getUserByWalletAddressExactly(
                    superAdminDto.walletAddress,
                )
            if (
                superAdminExited &&
                superAdminExited.walletAddress !== superAdmin.walletAddress
            ) {
                throw new HttpException(
                    httpErrors.DUPLICATE_WALLET_ADDRESS,
                    HttpStatus.BAD_REQUEST,
                )
            }
        }

        superAdminExited = await this.userService.getUserByEmailExactly(
            superAdminDto.email,
        )
        if (superAdminExited && superAdminExited.email !== superAdmin.email) {
            throw new HttpException(
                httpErrors.DUPLICATE_EMAIL_USER,
                HttpStatus.BAD_REQUEST,
            )
        }

        const updatedSuperAdminCompany =
            await this.userService.updateSuperAdminCompany(
                companyId,
                superAdminCompanyId,
                superAdminDto,
            )
        return updatedSuperAdminCompany
    }

    async getAllPlans(getAllPlanDto: GetAllPlanDto) {
        const plans = await this.planService.getAllPlans(getAllPlanDto)
        return plans
    }

    async getAllPCompanyStatus(getAllCompanyStatusDto: GetAllCompanyStatusDto) {
        const companyStatuses =
            await this.companyStatusService.getAllCompanyStatus(
                getAllCompanyStatusDto,
            )
        return companyStatuses
    }

    async createCompany(
        createCompanyDto: CreateCompanyDto,
        systemAdminId: number,
    ) {
        const company = await this.companyService.createCompany(
            createCompanyDto,
            systemAdminId,
        )
        return company
    }

    async getAllUserStatus(getAllUserStatusDto: GetAllUserStatusDto) {
        const userStatus = await this.userStatusService.getAllUserStatus(
            getAllUserStatusDto,
        )
        return userStatus
    }

    async getPlanId(planId: number) {
        const plan = await this.planService.getPlanById(planId)
        return plan
    }

    async updatePlan(
        planId: number,
        updatePlanDto: UpdatePlanDto,
        systemAdminId: number,
    ): Promise<Plan> {
        const updatePlan = await this.planService.updatePlan(
            planId,
            updatePlanDto,
            systemAdminId,
        )
        return updatePlan
    }

    async createPlan(createPlanDto: CreatePlanDto, systemAdminId: number) {
        const plan = await this.planService.createPlan(
            createPlanDto,
            systemAdminId,
        )
        return plan
    }

    async getAllSystemAdmin(): Promise<SystemAdmin[]> {
        const systemAdmins =
            await this.systemAdminRepository.getAllSystemAdmin()
        return systemAdmins
    }

    async statisticalCompany(month: number, year: number) {
        const companyStatuses =
            await this.companyStatusService.getAllCompanyByStatusId(month, year)

        const userStatuses = await this.userStatusService.getAllUserByStatusId(
            month,
            year,
        )

        const servicePlan = await this.planService.countCompanyUseServicePlan(
            month,
            year,
        )

        return {
            companyStatuses: companyStatuses.items,
            userStatuses: userStatuses.items,
            servicePlan: servicePlan.items,
        }
    }

    async createSysNotification(
        createSysNotificationDto: createSystemNotificationDto,
        systemId: number,
    ): Promise<SystemNotification> {
        const createSysNotification =
            this.systemNotificationService.createSystemNotification(
                createSysNotificationDto,
                systemId,
            )

        return createSysNotification
    }

    async getAllSysNotification(
        getAllSysNotificationDto: getAllSysNotificationDto,
    ): Promise<Pagination<SystemNotification>> {
        const sysNotification =
            this.systemNotificationService.getAllSystemNotification(
                getAllSysNotificationDto,
            )

        return sysNotification
    }

    async updateSysNotification(
        sysNotificationId: number,
        updateSysNotification: updateSystemNotificationDto,
        systemAdminId: number,
    ): Promise<SystemNotification> {
        const updatedSysNotification =
            await this.systemNotificationService.updateSystemNotification(
                sysNotificationId,
                updateSysNotification,
                systemAdminId,
            )

        return updatedSysNotification
    }

    async getAllServiceSub(
        getAllServiceSubDto: GetAllServiceSubscription,
    ): Promise<Pagination<ServiceSubscription>> {
        const serviceSubscription =
            await this.serviceSubscriptionService.getAllServiceSubscription(
                getAllServiceSubDto,
            )

        return serviceSubscription
    }

    async createServiceSubscription(
        createServiceSubscriptionDto: CreateServiceSubscriptionDto,
        systemId: number,
    ): Promise<ServiceSubscription> {
        const serviceSubscription =
            await this.serviceSubscriptionService.createServiceSubscription(
                createServiceSubscriptionDto,
                systemId,
            )

        return serviceSubscription
    }

    async getAllOptionCompany(): Promise<Company[]> {
        const optionCompany = await this.companyService.getOptionCompany()

        return optionCompany
    }

    async getAllOptionServicePlan(): Promise<Plan[]> {
        const optionCompany = await this.planService.getAllOptionServicePlan()

        return optionCompany
    }

    async getDetailServiceSubscriptionById(
        serviceSubscriptionId: number,
    ): Promise<ServiceSubscription> {
        const serviceSubscription =
            await this.serviceSubscriptionService.getDetailServiceSubscriptionById(
                serviceSubscriptionId,
            )

        return serviceSubscription
    }

    async updateServicePlanSubscription(
        id: number,
        updateServiceSubscriptionDto: UpdateServiceSubscriptionDto,
        systemAdminId: number,
    ): Promise<ServiceSubscription> {
        const serviceSubscriptionById =
            await this.serviceSubscriptionService.getSubscriptionServicePlanById(
                id,
            )

        if (!serviceSubscriptionById) {
            throw new HttpException(
                httpErrors.SUBSCRIPTION_SERVICE_PLAN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const isChangeStatus: boolean =
            updateServiceSubscriptionDto.status !==
            serviceSubscriptionById.status

        //Update serviceSubscription
        const serviceSubscription =
            await this.serviceSubscriptionService.updateServiceSubscription(
                id,
                updateServiceSubscriptionDto,
                systemAdminId,
                isChangeStatus,
            )

        if (
            updateServiceSubscriptionDto.status == StatusSubscription.CONFIRMED
        ) {
            //Send email to SupperAdmin of Company notice subscription ServicePlan is Approved by SystemAdmin
            const currentServicePlanOfCompany =
                await this.servicePlanOfCompanyService.getServicePlanOfCompany(
                    serviceSubscription.companyId,
                )

            //Get plan subscription
            const subscriptionServicePlan = await this.planService.getPlanById(
                serviceSubscriptionById.planId,
            )

            const existedCompany = await this.companyService.getCompanyById(
                serviceSubscription.companyId,
            )

            await this.emailService.sendEmailNoticeSuperSubscriptionIsApproved(
                serviceSubscriptionById.companyId,
                existedCompany.companyName,
                currentServicePlanOfCompany.plan.planName,
                String(currentServicePlanOfCompany.expirationDate),
                subscriptionServicePlan.planName,
                String(serviceSubscriptionById.activationDate),
                String(serviceSubscriptionById.expirationDate),
                serviceSubscriptionById.amount,
            )

            const activationDate = new Date(serviceSubscription.activationDate) // Create ActiveDate of Subscription
            const currentDate = new Date() // CurrentDate

            if (currentDate >= activationDate) {
                //Apply service subscription for company
                await this.servicePlanOfCompanyService.updateServicePlanForCompany(
                    serviceSubscription.id,
                    {
                        companyId: serviceSubscription.companyId,
                        planId: serviceSubscription.planId,
                        expirationDate: String(
                            serviceSubscription.expirationDate,
                        ),
                    },
                )
            }
        }
        return serviceSubscription
    }

    async updateStatusOfServiceSubscription(
        id: number,
        status: StatusSubscription,
        systemAdminId: number,
    ) {
        const serviceSubscriptionById =
            await this.serviceSubscriptionService.getSubscriptionServicePlanById(
                id,
            )

        if (!serviceSubscriptionById) {
            throw new HttpException(
                httpErrors.SUBSCRIPTION_SERVICE_PLAN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const serviceSubscription =
            await this.serviceSubscriptionService.changeStatusServiceSubscription(
                id,
                status,
                systemAdminId,
            )

        if (status == StatusSubscription.CONFIRMED) {
            //Send email to SupperAdmin of Company notice subscription ServicePlan is Approved by SystemAdmin
            const currentServicePlanOfCompany =
                await this.servicePlanOfCompanyService.getServicePlanOfCompany(
                    serviceSubscription.companyId,
                )

            //Get plan subscription
            const subscriptionServicePlan = await this.planService.getPlanById(
                serviceSubscriptionById.planId,
            )

            const existedCompany = await this.companyService.getCompanyById(
                serviceSubscription.companyId,
            )

            await this.emailService.sendEmailNoticeSuperSubscriptionIsApproved(
                serviceSubscriptionById.companyId,
                existedCompany.companyName,
                currentServicePlanOfCompany.plan.planName,
                String(currentServicePlanOfCompany.expirationDate),
                subscriptionServicePlan.planName,
                String(serviceSubscriptionById.activationDate),
                String(serviceSubscriptionById.expirationDate),
                serviceSubscriptionById.amount,
            )
        }

        const activationDate = new Date(serviceSubscription.activationDate) // Create ActiveDate of Subscription
        const currentDate = new Date() // CurrentDate

        // If the approval date is greater than or equal to the registration service plan date
        if (
            currentDate >= activationDate &&
            status == StatusSubscription.CONFIRMED
        ) {
            // console.log('Approved subscription now!!!')
            const servicePlanOfCompany =
                await this.servicePlanOfCompanyService.updateServicePlanForCompany(
                    serviceSubscription.id,
                    {
                        companyId: serviceSubscription.companyId,
                        planId: serviceSubscription.planId,
                        expirationDate: String(
                            serviceSubscription.expirationDate,
                        ),
                    },
                )

            return servicePlanOfCompany
        }

        if (status == StatusSubscription.APPLIED) {
            // console.log('Approved subscription now!!!')
            const servicePlanOfCompany =
                await this.servicePlanOfCompanyService.updateServicePlanForCompany(
                    serviceSubscription.id,
                    {
                        companyId: serviceSubscription.companyId,
                        planId: serviceSubscription.planId,
                        expirationDate: String(
                            serviceSubscription.expirationDate,
                        ),
                    },
                )

            return servicePlanOfCompany
        }

        return serviceSubscription
    }

    async applyServiceSubscriptionForCompanyNow(
        id: number,
        status: StatusSubscription,
        systemAdminId: number,
    ) {
        // console.log('Approved subscription now!!!')
        const serviceSubscriptionById =
            await this.serviceSubscriptionService.getSubscriptionServicePlanById(
                id,
            )

        if (!serviceSubscriptionById) {
            throw new HttpException(
                httpErrors.SUBSCRIPTION_SERVICE_PLAN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        try {
            const serviceSubscription =
                await this.serviceSubscriptionService.changeStatusServiceSubscription(
                    id,
                    status,
                    systemAdminId,
                )

            if (status == StatusSubscription.CONFIRMED) {
                //Send email to SupperAdmin of Company notice subscription ServicePlan is Approved by SystemAdmin
                const currentServicePlanOfCompany =
                    await this.servicePlanOfCompanyService.getServicePlanOfCompany(
                        serviceSubscription.companyId,
                    )

                //Get plan subscription
                const subscriptionServicePlan =
                    await this.planService.getPlanById(
                        serviceSubscriptionById.planId,
                    )

                const existedCompany = await this.companyService.getCompanyById(
                    serviceSubscription.companyId,
                )

                await this.emailService.sendEmailNoticeSuperSubscriptionIsApproved(
                    serviceSubscriptionById.companyId,
                    existedCompany.companyName,
                    currentServicePlanOfCompany.plan.planName,
                    String(currentServicePlanOfCompany.expirationDate),
                    subscriptionServicePlan.planName,
                    String(serviceSubscriptionById.activationDate),
                    String(serviceSubscriptionById.expirationDate),
                    serviceSubscriptionById.amount,
                )
            }

            const servicePlanOfCompany =
                await this.servicePlanOfCompanyService.updateServicePlanForCompany(
                    serviceSubscription.id,
                    {
                        companyId: serviceSubscription.companyId,
                        planId: serviceSubscription.planId,
                        expirationDate: String(
                            serviceSubscription.expirationDate,
                        ),
                    },
                )

            return servicePlanOfCompany
        } catch (error) {
            throw new HttpException(
                httpErrors.APPLY_SERVICE_SUBSCRIPTION_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getDetailServicePlanOfCompany(
        companyId: number,
    ): Promise<CompanyServicePlan> {
        const servicePlanOfCompany =
            await this.servicePlanOfCompanyService.getServicePlanOfCompany(
                companyId,
            )

        return servicePlanOfCompany
    }

    async getAllServicePlanSubscriptionOfCompany(
        getAllServiceSubscriptionDto: GetAllServiceSubscription,
        companyId: number,
    ): Promise<Pagination<ServiceSubscription>> {
        const serviceSubscriptionOfCompany =
            this.serviceSubscriptionService.getAllServiceSubscriptionByCompanyId(
                getAllServiceSubscriptionDto,
                companyId,
            )

        return serviceSubscriptionOfCompany
    }
}
