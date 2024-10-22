import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
    Body,
    Controller,
    forwardRef,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import {
    CreateCompanyDto,
    GetAllCompanyDto,
    RegisterCompanyDto,
} from '@dtos/company.dto'
import { SystemAdminService } from '@api/modules/system-admin/system-admin.service'
import { GetAllCompanyStatusDto, UpdateCompanyDto } from '@dtos/company.dto'
import { SuperAdminDto } from '@dtos/user.dto'
import { GetAllPlanDto, UpdatePlanDto, CreatePlanDto } from '@dtos/plan.dto'
import { SystemAdminGuard } from '@shares/guards/systemadmin.guard'
import { GetAllUserStatusDto } from '@dtos/user-status.dto'
import { EmailService } from '@api/modules/emails/email.service'
import {
    createSystemNotificationDto,
    getAllSysNotificationDto,
    updateSystemNotificationDto,
} from '@dtos/system-notification.dto'
import { UserScope } from '@shares/decorators/user.decorator'
import { SystemAdmin } from '@entities/system-admin.entity'
import { GetStaticInMonthDto } from '@dtos/meeting.dto'
import {
    CreateServiceSubscriptionDto,
    GetAllServiceSubscription,
    UpdateServiceSubscriptionDto,
    UpdateStatusServiceSubscriptionDto,
} from '@dtos/service-subscription.dto'

@Controller('system-admin')
@ApiTags('system-admin')
export class SystemAdminController {
    constructor(
        private readonly systemAdminService: SystemAdminService,
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
    ) {}
    @Get('/get-all-company')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async getAllCompanies(@Query() getAllCompanyDto: GetAllCompanyDto) {
        const companies = await this.systemAdminService.getAllCompanys(
            getAllCompanyDto,
        )
        return companies
    }

    @Get('/company/:id')
    @UseGuards(SystemAdminGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getCompanyById(@Param('id') companyId: number) {
        const company = await this.systemAdminService.getCompanyById(companyId)
        return company
    }

    @Patch('/company/:id')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateCompany(
        @Param('id') companyId: number,
        @Body() updateCompanyDto: UpdateCompanyDto,
        @UserScope() system: SystemAdmin,
    ) {
        const systemAdminId = system.id

        const updatedCompany = await this.systemAdminService.updateCompany(
            companyId,
            updateCompanyDto,
            systemAdminId,
        )
        return updatedCompany
    }

    @Get('/plan')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    // @UseGuards(SystemAdminGuard)
    async getAllPlans(@Query() getAllPlanDto: GetAllPlanDto) {
        const plans = await this.systemAdminService.getAllPlans(getAllPlanDto)
        return plans
    }

    @Get('/company-status')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async getAllCompanyStatus(
        @Query() getAllCompanyStatusDto: GetAllCompanyStatusDto,
    ) {
        const companyStatus =
            await this.systemAdminService.getAllPCompanyStatus(
                getAllCompanyStatusDto,
            )
        return companyStatus
    }

    @Patch('/company/:companyId/superadmin/:id')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateSuperAdmin(
        @Param('companyId') companyId: number,
        @Param('id') superAdminCompanyId: number,
        @Body() superAdminDto: SuperAdminDto,
    ) {
        const updatedSuperAdminCompany =
            await this.systemAdminService.updateSuperAdminCompany(
                companyId,
                superAdminCompanyId,
                superAdminDto,
            )
        return updatedSuperAdminCompany
    }

    @Post('/company')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async createCompany(
        @Body() createCompanyDto: CreateCompanyDto,
        @UserScope() system: SystemAdmin,
    ) {
        const systemAdminId = system.id

        const company = await this.systemAdminService.createCompany(
            createCompanyDto,
            systemAdminId,
        )
        return company
    }

    @Get('/user-status')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async getAllUserStatus(
        @Query() getAllUserStatusDto: GetAllUserStatusDto,
        // @fUserScope() user: User,
    ) {
        const userStatus = await this.systemAdminService.getAllUserStatus(
            getAllUserStatusDto,
        )
        return userStatus
    }

    //Plan
    @Get('/plan/:id')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async getPlanById(@Param('id') planId: number) {
        const plan = await this.systemAdminService.getPlanId(planId)
        return plan
    }

    @Patch('/plan/:id')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updatePlan(
        @Param('id') planId: number,
        @Body() updatePlanDto: UpdatePlanDto,
        @UserScope() system: SystemAdmin,
    ) {
        const systemAdminId = system.id

        const updatedPlan = await this.systemAdminService.updatePlan(
            planId,
            updatePlanDto,
            systemAdminId,
        )
        return updatedPlan
    }

    @Post('/plan')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async createPlan(
        @Body() createPlanDto: CreatePlanDto,
        @UserScope() system: SystemAdmin,
    ) {
        const systemAdminId = system.id

        const plan = await this.systemAdminService.createPlan(
            createPlanDto,
            systemAdminId,
        )
        return plan
    }

    @Post('/register-company')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async sendEmailRegisterCompany(
        @Body() registerCompanyDto: RegisterCompanyDto,
    ) {
        await this.emailService.sendEmailRegisterCompany(registerCompanyDto)
        return 'Emails  register information company send to system admin successfully'
    }

    @Get('/statistical')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async statisticalCompany(@Query() getStaticInMonth: GetStaticInMonthDto) {
        const { month, year } = getStaticInMonth

        const statistical = await this.systemAdminService.statisticalCompany(
            month,
            year,
        )

        return statistical
    }

    @Get('/system-notification')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async getAllSysNotification(
        @Query() getAllSysNotification: getAllSysNotificationDto,
    ) {
        const sysNotification = this.systemAdminService.getAllSysNotification(
            getAllSysNotification,
        )

        return sysNotification
    }

    @Post('/system-notification')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async createSystemNotification(
        @Body() createSysNotificationDto: createSystemNotificationDto,
        @UserScope() system: SystemAdmin,
    ) {
        const sysNotification =
            await this.systemAdminService.createSysNotification(
                createSysNotificationDto,
                system.id,
            )

        return sysNotification
    }

    @Patch('/system-notification/:id')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateSystemNotification(
        @Param('id') sysNotificationId: number,
        @Body() updateSysNotification: updateSystemNotificationDto,
        @UserScope() system: SystemAdmin,
    ) {
        const systemId = system.id

        const updatedPlan = await this.systemAdminService.updateSysNotification(
            sysNotificationId,
            updateSysNotification,
            systemId,
        )
        return updatedPlan
    }

    @Get('/get-all-option-company')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async getAllOptionCompany() {
        const optionCompany =
            await this.systemAdminService.getAllOptionCompany()

        return optionCompany
    }

    @Get('/get-all-option-plan')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async getAllOptionPlan() {
        const optionCompany =
            await this.systemAdminService.getAllOptionServicePlan()

        return optionCompany
    }

    @Get('/service-subscription')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async getAllServiceSubscription(
        @Query() getAllServiceSubDto: GetAllServiceSubscription,
    ) {
        const serviceSubscription =
            await this.systemAdminService.getAllServiceSub(getAllServiceSubDto)

        return serviceSubscription
    }

    @Post('/service-subscription')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async createServiceSubscription(
        @Body() createServiceSubscriptionDto: CreateServiceSubscriptionDto,
        @UserScope() system: SystemAdmin,
    ) {
        const systemId = system.id

        const serviceSubscriptionCreated =
            await this.systemAdminService.createServiceSubscription(
                createServiceSubscriptionDto,
                systemId,
            )

        return serviceSubscriptionCreated
    }

    @Get('/service-subscription/:id')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async getDetailServiceSubscription(
        @Param('id') serviceSubscriptionId: number,
    ) {
        const serviceSubscription =
            await this.systemAdminService.getDetailServiceSubscriptionById(
                serviceSubscriptionId,
            )
        return serviceSubscription
    }

    @Patch('/service-subscription/:id')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateServiceSubscription(
        @Param('id') ServiceSubscriptionId: number,
        @Body() updateServiceSubscriptionDto: UpdateServiceSubscriptionDto,
        @UserScope() system: SystemAdmin,
    ) {
        const systemAdminId = system.id

        const updatedServiceSubscription =
            await this.systemAdminService.updateServicePlanSubscription(
                ServiceSubscriptionId,
                updateServiceSubscriptionDto,
                systemAdminId,
            )
        return updatedServiceSubscription
    }

    @Patch('/service-subscription/:id/change-status')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateStatusServiceSubscription(
        @Param('id') ServiceSubscriptionId: number,
        @Body() updatePlanDto: UpdateStatusServiceSubscriptionDto,
        @UserScope() system: SystemAdmin,
    ) {
        const { status } = updatePlanDto
        const systemAdminId = system.id

        const updatedPlan =
            await this.systemAdminService.updateStatusOfServiceSubscription(
                ServiceSubscriptionId,
                status,
                systemAdminId,
            )
        return updatedPlan
    }

    @Patch('/service-subscription/:id/apply-now')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async applyServiceSubscriptionForCompanyNow(
        @Param('id') ServiceSubscriptionId: number,
        @Body() updatePlanDto: UpdateStatusServiceSubscriptionDto,
        @UserScope() system: SystemAdmin,
    ) {
        const { status } = updatePlanDto
        const systemAdminId = system.id

        const updatedPlan =
            await this.systemAdminService.applyServiceSubscriptionForCompanyNow(
                ServiceSubscriptionId,
                status,
                systemAdminId,
            )
        return updatedPlan
    }

    @Get('/company/:id/service-plan')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async getServicePlanOfCompany(@Param('id') companyId: number) {
        const servicePlanOfCompany =
            await this.systemAdminService.getDetailServicePlanOfCompany(
                companyId,
            )

        return servicePlanOfCompany
    }

    @Get('/company/:id/service-plan/subscription')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async getAllServicePlanSubscription(
        @Param('id') companyId: number,
        @Query()
        getAllServiceSubscriptionOfCompanyDto: GetAllServiceSubscription,
    ) {
        const serviceSubscriptionOfCompany =
            await this.systemAdminService.getAllServicePlanSubscriptionOfCompany(
                getAllServiceSubscriptionOfCompanyDto,
                companyId,
            )

        return serviceSubscriptionOfCompany
    }
}
