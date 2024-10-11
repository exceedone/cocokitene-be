import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ServiceSubscriptionService } from './service-subscription.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { PermissionEnum } from '@shares/constants'
import { Permission } from '@shares/decorators/permission.decorator'
import { GetAllServiceSubscription } from '@dtos/service-subscription.dto'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'

@Controller('service-subscription')
@ApiTags('service-subscription')
export class ServiceSubscriptionController {
    constructor(
        private readonly serviceSubscriptionService: ServiceSubscriptionService,
    ) {}

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SUPER_ADMIN_PERMISSION)
    async getAllServiceSubscriptionOfCompany(
        @Query()
        getAllServiceSubscriptionOfCompanyDto: GetAllServiceSubscription,
        @UserScope() user: User,
    ) {
        const companyId = user.companyId
        const serviceSubscriptionOfCompany =
            this.serviceSubscriptionService.getAllServiceSubscriptionByCompanyId(
                getAllServiceSubscriptionOfCompanyDto,
                companyId,
            )

        return serviceSubscriptionOfCompany
    }
}
