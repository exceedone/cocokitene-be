import { Module } from '@nestjs/common'
import { ChatPermissionService } from '@api/modules/chat-permission/chat-permission.service'

@Module({
    imports: [],
    controllers: [],
    providers: [ChatPermissionService],
    exports: [ChatPermissionService],
})
export class ChatPermissionModule {}
