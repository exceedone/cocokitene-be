import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MessageService } from '@api/modules/messages/message.service'

import { messageChatInformation } from './socket.interface'

@WebSocketGateway({
    namespace: '/',
    cors: true,
    transports: ['websocket'],
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(private readonly messageService: MessageService) {}

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id)
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id)
    }

    @SubscribeMessage('send_chat_public')
    async handleCreateMessage(
        @MessageBody() messageChatInfo: messageChatInformation,
        @ConnectedSocket() client: Socket,
    ) {
        const { meetingId } = messageChatInfo
        const createMessageDto = {
            meetingId: meetingId,
            receiverId: messageChatInfo.receiver.id,
            senderId: messageChatInfo.sender.id,
            content: messageChatInfo.content,
        }
        const createdMessage = await this.messageService.createMessage(
            createMessageDto,
        )

        console.log('createdMessage', createdMessage)

        const createdMessageResponse = {
            ...createdMessage,
            sender: {
                id: createdMessage.senderId,
                email: messageChatInfo.sender.email,
            },
            receiver: {
                id: createdMessage.receiverId,
                email: messageChatInfo.receiver.email,
            },
            replyMessage: messageChatInfo.replyMessage,
        }
        client.broadcast
            // .to(meetingId.toString())
            .emit(`receive_chat_public/${meetingId}`, createdMessageResponse)
    }

    @SubscribeMessage('send_chat_private')
    async handleCreateMessagePrivate(
        @MessageBody() messageChatInfo: messageChatInformation,
        @ConnectedSocket() client: Socket,
    ) {
        const { meetingId } = messageChatInfo

        const createMessagePrivateDto = {
            meetingId: meetingId,
            receiverId: messageChatInfo.receiver.id,
            senderId: messageChatInfo.sender.id,
            content: messageChatInfo.content,
        }

        const createdMessagePrivate =
            await this.messageService.createMessagePrivate(
                createMessagePrivateDto,
            )

        const createdMessageResponse = {
            ...createdMessagePrivate,
            sender: {
                id: createdMessagePrivate.senderId,
                email: messageChatInfo.sender.email,
            },
            receiver: {
                id: createdMessagePrivate.receiverId,
                email: messageChatInfo.receiver.email,
            },
            replyMessage: messageChatInfo.replyMessage,
        }

        client.broadcast
            // .to(meetingId.toString())
            .emit(
                `receive_chat_private/${meetingId}/${createdMessagePrivate.receiverId}`,
                createdMessageResponse,
            )
    }
}
