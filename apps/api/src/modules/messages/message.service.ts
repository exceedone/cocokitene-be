import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { MessageRepository } from '@repositories/message.repository'
import { CreateMessageDto, CreateMessagePrivateDto } from '@dtos/message.dto'
import { Message } from '@entities/message.entity'
import {
    DataChatResponseDetail,
    DataMessageChat,
} from '@api/modules/messages/message.interface'

@Injectable()
export class MessageService {
    constructor(private readonly messageRepository: MessageRepository) {}

    async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
        try {
            const createdMessage = await this.messageRepository.createMessage(
                createMessageDto,
            )
            return createdMessage
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async createMessagePrivate(
        createMessagePrivateDto: CreateMessagePrivateDto,
    ): Promise<Message> {
        try {
            const createdMessagePrivate =
                await this.messageRepository.createMessagePrivate(
                    createMessagePrivateDto,
                )
            return createdMessagePrivate
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getDataMessageByMeetingId(
        userId: number,
        meetingId: number,
    ): Promise<DataChatResponseDetail> {
        const messages = await this.messageRepository.getDataMessageByMeetingId(
            userId,
            meetingId,
        )

        // console.log('messages', messages)
        const messageChat: DataMessageChat[] = messages.map((message) => {
            return {
                id: message.id,
                sender: {
                    id: message.sender.id,
                    email: message.sender.email,
                },
                receiver: message.receiver
                    ? {
                          id: message.receiver.id,
                          email: message.receiver.email,
                      }
                    : { id: 0, email: 'EveryOne' },
                content: message.content,
                createdAt: message.createdAt,
                replyMessage: message.replyMessage
                    ? {
                          id: message.replyMessage.id,
                          senderId: {
                              id: message.replyMessage.sender.id,
                              email: message.replyMessage.sender.email,
                          },
                          receiverId: message.replyMessage.receiver
                              ? {
                                    id: message.replyMessage.receiver.id,
                                    email: message.replyMessage.receiver.email,
                                }
                              : {
                                    id: 0,
                                    email: 'EveryOne',
                                },
                          content: message.replyMessage.content,
                      }
                    : null,
            }
        })

        return {
            rootChat: meetingId,
            messageChat: messageChat,
        }
    }
}
