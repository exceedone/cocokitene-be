import { MessageService } from '@api/modules/messages/message.service'
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { CreateReactionMessageDto } from '@dtos/reaction-messsage.dto'
import { ReactionIconService } from '../reaction-icons/reaction-icon.service'
import { ReactionMessageService } from '../reaction_messages/reaction-message.service'
import { messageChatInformation } from './socket.interface'
import { ChangePermissionChatInMeetingDto } from '@dtos/chat-permission.dto'
import { MeetingService } from '../meetings/meeting.service'
import { UserSeenMessageService } from '../user-seen-message/user-seen-message.service'

@WebSocketGateway({
    namespace: '/',
    cors: true,
    transports: ['websocket'],
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(
        private readonly messageService: MessageService,
        private readonly reactionMessageService: ReactionMessageService,
        private readonly reactionIconService: ReactionIconService,
        private readonly meetingService: MeetingService,
        private readonly userSeenMessageService: UserSeenMessageService,
    ) {}

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id)
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id)
    }

    @SubscribeMessage('send_chat_public')
    async handleCreateMessage(
        @MessageBody() messageChatInfo: messageChatInformation,
        // @ConnectedSocket() client: Socket,
    ) {
        const { meetingId } = messageChatInfo
        const createMessageDto = {
            meetingId: meetingId,
            receiverId: messageChatInfo.receiver.id,
            senderId: messageChatInfo.sender.id,
            content: messageChatInfo.content,
            replyMessageId: messageChatInfo?.replyMessage?.id,
        }
        const createdMessage = await this.messageService.createMessage(
            createMessageDto,
        )

        // console.log('createdMessage', createdMessage)

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

        await this.userSeenMessageService.updateLastMessageUserSeen(
            createdMessage.senderId,
            createdMessage.meetingId,
            createdMessage.id,
        )
        // client.broadcast
        this.server
            // .to(meetingId.toString())
            .emit(`receive_chat_public/${meetingId}`, createdMessageResponse)
    }

    @SubscribeMessage('send_chat_private')
    async handleCreateMessagePrivate(
        @MessageBody() messageChatInfo: messageChatInformation,
        // @ConnectedSocket() client: Socket,
    ) {
        const { meetingId } = messageChatInfo

        const createMessagePrivateDto = {
            meetingId: meetingId,
            receiverId: messageChatInfo.receiver.id,
            senderId: messageChatInfo.sender.id,
            content: messageChatInfo.content,
            replyMessageId: messageChatInfo?.replyMessage?.id,
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

        await this.userSeenMessageService.updateLastMessageUserSeen(
            createdMessagePrivate.senderId,
            createdMessagePrivate.meetingId,
            createdMessagePrivate.id,
        )

        // client.broadcast
        // .to(meetingId.toString())
        this.server.emit(
            `receive_chat_private/${meetingId}/${createdMessagePrivate.receiverId}`,
            createdMessageResponse,
        )

        this.server.emit(
            `receive_chat_private/${meetingId}/${createdMessagePrivate.senderId}`,
            createdMessageResponse,
        )
    }

    @SubscribeMessage('send_reaction_message_public')
    async handleCreateReactionMessage(
        @MessageBody() createReactionMessageDto: CreateReactionMessageDto,
        // @ConnectedSocket() client: Socket,
    ) {
        const { meetingId, reactionIconId } = createReactionMessageDto

        console.log(
            'reaction message ID : ',
            reactionIconId,
            createReactionMessageDto.messageId,
        )
        const createdReactionMessage =
            await this.reactionMessageService.createReactionMessage(
                createReactionMessageDto,
            )
        const reactionIcon = await this.reactionIconService.getReactionIconById(
            reactionIconId,
        )
        const createdReactionMessageResponse = {
            ...createdReactionMessage,
            emoji: {
                id: reactionIcon.id,
                key: reactionIcon.key,
            },
        }

        this.server.emit(
            // `receive_reaction_message_public/${meetingId}`,
            `receive_reaction_message_public/${meetingId}`,
            createdReactionMessageResponse,
        )
    }

    @SubscribeMessage('send_reaction_message_private')
    async handleCreateReactionMessagePrivate(
        @MessageBody() createReactionMessageDto: CreateReactionMessageDto,
        // @ConnectedSocket() client: Socket,
    ) {
        const { meetingId, to, reactionIconId, from } = createReactionMessageDto
        // console.log('createReactionMessageDto----', createReactionMessageDto)
        const createdReactionMessage =
            await this.reactionMessageService.createReactionMessage(
                createReactionMessageDto,
            )
        const reactionIcon = await this.reactionIconService.getReactionIconById(
            reactionIconId,
        )
        const createdReactionMessageResponse = {
            ...createdReactionMessage,
            emoji: {
                id: reactionIcon.id,
                key: reactionIcon.key,
            },
        }

        this.server.emit(
            `receive_reaction_message_private/${meetingId}/${to}`,
            createdReactionMessageResponse,
        )
        this.server.emit(
            `receive_reaction_message_private/${meetingId}/${from}`,
            createdReactionMessageResponse,
        )
    }

    @SubscribeMessage('permission_chat_meeting')
    async handleUpdatePermissionChat(
        @MessageBody()
        changePermissionChatDto: ChangePermissionChatInMeetingDto,
    ) {
        const { userId, meetingId, companyId, permissionChatId } =
            changePermissionChatDto

        try {
            const meetingPermissionChat =
                await this.meetingService.changePermissionChatInMeeting(
                    userId,
                    meetingId,
                    companyId,
                    permissionChatId,
                )

            this.server.emit(
                `permission_chat_meeting/${meetingId}`,
                meetingPermissionChat,
            )
        } catch (error) {
            console.log('error: ', error.response.message)
        }
    }
}
