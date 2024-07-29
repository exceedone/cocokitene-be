import { Repository } from 'typeorm'
import { Reaction } from '@entities/reaction-messages.entity'
import { CustomRepository } from '@shares/decorators'
import {
    CreateReactionMessageDto,
    UpdateReactionMessageDto,
} from '@dtos/reaction-messsage.dto'

@CustomRepository(Reaction)
export class ReactionMessagesRepository extends Repository<Reaction> {
    async createReactionMessage(
        createReactionMessageDto: CreateReactionMessageDto,
    ): Promise<Reaction> {
        const { userId, messageId, reactionIconId } = createReactionMessageDto
        const createdReactionMessage = await this.create({
            userId: userId,
            messageId: messageId,
            emojiId: reactionIconId,
        })
        await createdReactionMessage.save()
        return createdReactionMessage
    }

    async updateReactionMessage(
        reactionMessageId: number,
        updatedReactionMessageDto: UpdateReactionMessageDto,
    ): Promise<Reaction> {
        const { userId, reactionIconId, messageId } = updatedReactionMessageDto
        await this.createQueryBuilder('reaction_message')
            .update(Reaction)
            .set({
                userId: userId,
                messageId: messageId,
                emojiId: reactionIconId,
            })
            .where('id = :id', { id: reactionMessageId })
            .execute()
        const updatedReactionMessage = await this.findOne({
            where: {
                id: reactionMessageId,
            },
        })
        return updatedReactionMessage
    }
}
