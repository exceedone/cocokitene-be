import { Repository } from 'typeorm'
import { Emoji } from '@entities/reaction-icon.entity'
import { CustomRepository } from '@shares/decorators'
@CustomRepository(Emoji)
export class ReactionIconRepository extends Repository<Emoji> {}
