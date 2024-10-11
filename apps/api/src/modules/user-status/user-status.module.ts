import { Module } from '@nestjs/common'
import { UserStatusController } from '@api/modules/user-status/user-status.controller'
import { UserStatusService } from '@api/modules/user-status/user-status.service'

@Module({
    imports: [],
    controllers: [UserStatusController],
    providers: [UserStatusService],
    exports: [UserStatusService],
})
export class UserStatusModule {}
