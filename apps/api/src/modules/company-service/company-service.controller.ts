import { User } from '@entities/user.entity'
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PermissionEnum } from '@shares/constants'
import { Permission } from '@shares/decorators/permission.decorator'
import { UserScope } from '@shares/decorators/user.decorator'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { ServicePlanOfCompanyService } from './company-service.service'
import { SubscriptionServiceDto } from '@dtos/service-subscription.dto'
import { UpdateStorageUsedDto } from '@dtos/company-service.dto'

@Controller('company-service')
@ApiTags('company-service')
export class CompanyServiceController {
    constructor(
        private readonly servicePlanOfCompanyService: ServicePlanOfCompanyService,
    ) {}

    @Get('/')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SUPER_ADMIN_PERMISSION)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getCompanyServicePlanByCompanyId(@UserScope() user: User) {
        const companyId = user.companyId

        const servicePlanOfCompany =
            await this.servicePlanOfCompanyService.getServicePlanOfCompany(
                companyId,
            )

        return servicePlanOfCompany
    }

    @Post('/subscription')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SUPER_ADMIN_PERMISSION)
    async subscriptionServicePlanForCompany(
        @Body() subscriptionServicePlanDto: SubscriptionServiceDto,
    ) {
        const subscriptionServicePlan =
            await this.servicePlanOfCompanyService.subscriptionServicePlanForCompany(
                subscriptionServicePlanDto,
            )

        return subscriptionServicePlan
    }

    @Get('/allowUploadFile')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.BASIC_PERMISSION)
    async getAllowUploadFile(@UserScope() user: User) {
        const companyId = user.companyId
        const allowUploadFile =
            await this.servicePlanOfCompanyService.getAllowUploadFile(companyId)

        return allowUploadFile
    }

    @Get('/checkServiceExpired')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.BASIC_PERMISSION)
    async checkServiceExpired(@UserScope() user: User) {
        const companyId = user.companyId
        const serviceIsExpired =
            await this.servicePlanOfCompanyService.checkServiceExpired(
                companyId,
            )

        return serviceIsExpired
    }

    @Patch('/updateStorage')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.BASIC_PERMISSION)
    async updateStorageUsedOfServicePlanForCompany(
        @Body() updateStorageUsed: UpdateStorageUsedDto,
        @UserScope() user: User,
    ) {
        const companyId = user.companyId

        const subscriptionServicePlan =
            await this.servicePlanOfCompanyService.updateStorageUsed(
                companyId,
                updateStorageUsed.storageUsed,
            )

        return subscriptionServicePlan
    }
}
