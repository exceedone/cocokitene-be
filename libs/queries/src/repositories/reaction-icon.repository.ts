import { Repository } from 'typeorm'
import { Emoji } from '@entities/reaction-icon.entity'
import { CustomRepository } from '@shares/decorators'
@CustomRepository(Emoji)
export class ReactionIconRepository extends Repository<Emoji> {
    async getReactionIcons(): Promise<Emoji[]> {
        const querBuider = this.createQueryBuilder('reaction_icon_mst').select([
            'reaction_icon_mst.id',
            'reaction_icon_mst.key',
            'reaction_icon_mst.description',
        ])
        const reactionIcons = await querBuider.getMany()
        return reactionIcons
    }
}
