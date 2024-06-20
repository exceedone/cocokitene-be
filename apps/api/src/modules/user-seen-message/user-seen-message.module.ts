import { Module } from '@nestjs/common'
import { UserSeenMessageService } from './user-seen-message.service'
import { UserSeenMessageController } from './user-seen_message.controller'

@Module({
    controllers: [UserSeenMessageController],
    providers: [UserSeenMessageService],
    exports: [UserSeenMessageService],
})
export class UserSeenMessageModule {}
