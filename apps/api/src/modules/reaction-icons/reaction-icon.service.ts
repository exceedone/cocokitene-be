import { Injectable } from '@nestjs/common'
import { ReactionIconRepository } from '@repositories/reaction-icon.repository'

@Injectable()
export class ReactionIconService {
    constructor(
        private readonly reactionIconRepository: ReactionIconRepository,
    ) {}

    async getReactionIcons() {
        const reactionIcons =
            await this.reactionIconRepository.getReactionIcons()
        return reactionIcons
    }

    async getReactionIconById(reactionIconId: number) {
        const reactionIcon = await this.reactionIconRepository.findOne({
            where: {
                id: reactionIconId,
            },
        })
        return reactionIcon
    }
}
