import { Module } from '@nestjs/common'
import { MessageService } from '@api/modules/messages/message.service'
import { MessageController } from '@api/modules/messages/message.controller'

@Module({
    imports: [],
    controllers: [MessageController],
    providers: [MessageService],
    exports: [MessageService],
})
export class MessageModule {}
