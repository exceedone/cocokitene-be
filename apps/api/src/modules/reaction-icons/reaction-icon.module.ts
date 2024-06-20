import { Module } from '@nestjs/common'
import { ReactionIconController } from './reaction-icon.controller'
import { ReactionIconService } from './reaction-icon.service'

@Module({
    imports: [],
    controllers: [ReactionIconController],
    providers: [ReactionIconService],
    exports: [ReactionIconService],
})
export class ReactionIconModule {}
