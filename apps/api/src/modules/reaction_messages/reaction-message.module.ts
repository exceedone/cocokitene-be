import { Module } from '@nestjs/common'
import { ReactionMessageService } from './reaction-message.service'

@Module({
    imports: [],
    controllers: [],
    providers: [ReactionMessageService],
    exports: [ReactionMessageService],
})
export class ReactionMessageModule {}
