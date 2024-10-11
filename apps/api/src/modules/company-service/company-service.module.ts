import { forwardRef, Module } from '@nestjs/common'
import { CompanyModule } from '../companys/company.module'
import { CompanyServiceController } from './company-service.controller'
import { ServicePlanOfCompanyService } from './company-service.service'
import { ServiceSubscriptionModule } from '../service-subscription/service-subscription.module'
import { PlanModule } from '../plans/plan.module'
import { EmailModule } from '../emails/email.module'

@Module({
    imports: [
        forwardRef(() => CompanyModule),
        forwardRef(() => ServiceSubscriptionModule),
        PlanModule,
        forwardRef(() => EmailModule),
    ],
    controllers: [CompanyServiceController],
    providers: [ServicePlanOfCompanyService],
    exports: [ServicePlanOfCompanyService],
})
export class CompanyServicePlanModule {}
