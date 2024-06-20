import { CreateReactionMessageDto } from '@dtos/reaction-messsage.dto'
import { Injectable } from '@nestjs/common'
import { ReactionMessagesRepository } from '@repositories/reaction-messages.repository'

@Injectable()
export class ReactionMessageService {
    constructor(
        private readonly reactionMessagesRepository: ReactionMessagesRepository, // private readonly reacti: ReactionMessageService
    ) {}

    async createReactionMessage(
        createReactionMessageDto: CreateReactionMessageDto,
    ) {
        const { userId, messageId, reactionIconId } = createReactionMessageDto
        const existedUserReactionMessage =
            await this.reactionMessagesRepository.findOne({
                where: {
                    userId: userId,
                    messageId: messageId,
                },
            })

        // console.log('existedUserReactionMessage', existedUserReactionMessage)
        if (existedUserReactionMessage) {
            if (existedUserReactionMessage.emojiId === reactionIconId) {
                const deletedReactionMessageId = existedUserReactionMessage.id
                await this.reactionMessagesRepository.delete(
                    existedUserReactionMessage.id,
                )
                return {
                    id: deletedReactionMessageId,
                    userId: null,
                    messageId: messageId,
                    emojiId: null,
                }
            } else {
                const updatedReactionMessage =
                    await this.reactionMessagesRepository.updateReactionMessage(
                        existedUserReactionMessage.id,
                        {
                            reactionIconId: reactionIconId,
                        },
                    )

                return updatedReactionMessage
            }
        } else {
            const createdReactionMessage =
                await this.reactionMessagesRepository.createReactionMessage(
                    createReactionMessageDto,
                )
            return createdReactionMessage
        }
    }
}
