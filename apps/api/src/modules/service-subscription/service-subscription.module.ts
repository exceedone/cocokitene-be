import { Module } from '@nestjs/common'
import { ServiceSubscriptionService } from './service-subscription.service'
import { ServiceSubscriptionController } from './service-subscription.controller'

@Module({
    imports: [
        // forwardRef(() => EmailModule),
        // EmailModule
    ],
    controllers: [ServiceSubscriptionController],
    providers: [ServiceSubscriptionService],
    exports: [ServiceSubscriptionService],
})
export class ServiceSubscriptionModule {}
