import { Repository } from 'typeorm'
import { Reaction } from '@entities/reaction-messages.entity'
import { CustomRepository } from '@shares/decorators'

@CustomRepository(Reaction)
export class ReactionMessagesRepository extends Repository<Reaction> {}
