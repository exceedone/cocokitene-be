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

@Controller('system-admin')
@ApiTags('system-admin')
export class SystemAdminController {
    constructor(
        private readonly systemAdminService: SystemAdminService,
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
    ) {}
    @Get('/get-all-companys')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async getAllCompanys(@Query() getAllCompanyDto: GetAllCompanyDto) {
        const companys = await this.systemAdminService.getAllCompanys(
            getAllCompanyDto,
        )
        return companys
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
    ) {
        const updatedCompany = await this.systemAdminService.updateCompany(
            companyId,
            updateCompanyDto,
        )
        return updatedCompany
    }

    @Get('/plans')
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

    @Post('/companys')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
        const company = await this.systemAdminService.createCompany(
            createCompanyDto,
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
    @Get('/plans/:id')
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
    ) {
        const updatedPlan = await this.systemAdminService.updatePlan(
            planId,
            updatePlanDto,
        )
        return updatedPlan
    }

    @Post('/plan')
    @UseGuards(SystemAdminGuard)
    @ApiBearerAuth()
    @UseGuards(SystemAdminGuard)
    async createPlan(@Body() createPlanDto: CreatePlanDto) {
        const plan = await this.systemAdminService.createPlan(createPlanDto)
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
}
