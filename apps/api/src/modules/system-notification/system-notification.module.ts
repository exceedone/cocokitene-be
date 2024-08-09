import { Module } from '@nestjs/common'
import { SystemNotificationService } from './system-notification.service'

@Module({
    providers: [SystemNotificationService],
    exports: [SystemNotificationService],
})
export class SystemNotificationModule {}
