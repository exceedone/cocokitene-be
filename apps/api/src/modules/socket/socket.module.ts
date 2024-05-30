import { Module } from '@nestjs/common'
import { SocketGateway } from '@api/modules/socket/socket.gateway'
import { MessageModule } from '@api/modules/messages/message.module'

@Module({
    imports: [MessageModule],
    controllers: [],
    providers: [SocketGateway],
    exports: [SocketGateway],
})
export class SocketModule {}
