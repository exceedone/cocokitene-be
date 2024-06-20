import { Module } from '@nestjs/common'
import { ChatPermissionService } from '@api/modules/chat-permission/chat-permission.service'
import { ChatPermissionController } from './chat-permission.controller'

@Module({
    imports: [],
    controllers: [ChatPermissionController],
    providers: [ChatPermissionService],
    exports: [ChatPermissionService],
})
export class ChatPermissionModule {}
