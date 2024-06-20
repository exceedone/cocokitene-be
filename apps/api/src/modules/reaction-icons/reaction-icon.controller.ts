import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { ReactionIconService } from './reaction-icon.service'

@Controller('reaction-icons')
@ApiTags('reaction-icons')
export class ReactionIconController {
    constructor(private readonly reactionIconService: ReactionIconService) {}

    @Get('')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getReactionIcons() {
        const reactionIcons = await this.reactionIconService.getReactionIcons()
        return reactionIcons
    }
}
