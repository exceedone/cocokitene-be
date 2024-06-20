import { Repository } from 'typeorm'
import { Message } from '@entities/message.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateMessageDto, CreateMessagePrivateDto } from '@dtos/message.dto'

@CustomRepository(Message)
export class MessageRepository extends Repository<Message> {
    async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
        const { meetingId, senderId, replyMessageId, receiverId, content } =
            createMessageDto
        const createdMessage = await this.create({
            meetingId: meetingId,
            senderId: senderId,
            replyMessageId: replyMessageId,
            content: content,
            receiverId: receiverId,
        })
        await createdMessage.save()
        return createdMessage
    }

    async createMessagePrivate(
        createMessagePrivateDto: CreateMessagePrivateDto,
    ): Promise<Message> {
        const { meetingId, senderId, receiverId, content, replyMessageId } =
            createMessagePrivateDto
        const createdMessage = await this.create({
            meetingId: meetingId,
            senderId: senderId,
            content: content,
            receiverId: receiverId,
            replyMessageId: replyMessageId,
        })
        await createdMessage.save()
        return createdMessage
    }

    async getDataMessageByMeetingId(
        userId: number,
        meetingId: number,
    ): Promise<Message[]> {
        const queryBuilder = this.createQueryBuilder('messages')
            .select(['messages.id', 'messages.content', 'messages.createdAt'])
            .leftJoin('messages.sender', 'sender')
            .addSelect(['sender.id', 'sender.email'])
            .leftJoin('messages.receiver', 'receiver')
            .addSelect(['receiver.id', 'receiver.email'])
            .leftJoinAndSelect('messages.replyMessage', 'replyMessage')
            .leftJoin('replyMessage.sender', 'replySender')
            .addSelect(['replySender.id', 'replySender.email'])
            .leftJoin('replyMessage.receiver', 'replyReceiver')
            .addSelect(['replyReceiver.id', 'replyReceiver.email'])
            .leftJoinAndSelect('messages.reactions', 'reactions')
            .leftJoin('reactions.emoji', 'emoji')
            .addSelect(['emoji.id', 'emoji.key'])
            .where('messages.meetingId = :meetingId', { meetingId: meetingId })
            .andWhere('messages.receiverId IS NULL')
            .orWhere(
                'messages.senderId = :senderId AND messages.meetingId = :meetingId',
                { senderId: userId, meetingId: meetingId },
            )
            .orWhere(
                'messages.receiverId = :receiverId AND messages.meetingId = :meetingId',
                { receiverId: userId, meetingId: meetingId },
            )

        const messages = await queryBuilder.getMany()
        return messages
    }
}
