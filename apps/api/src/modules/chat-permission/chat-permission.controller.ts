import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ChatPermissionService } from './chat-permission.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { GetAllChatPermissionDto } from '@dtos/chat-permission.dto'

@Controller('chat-permission')
@ApiTags('chat-permission')
export class ChatPermissionController {
    constructor(
        private readonly chatPermissionService: ChatPermissionService,
    ) {}

    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getAllChatPermission(
        @Query() getAllChatPermissionDto: GetAllChatPermissionDto,
    ) {
        const chatPermissions =
            await this.chatPermissionService.getAllChatPermission(
                getAllChatPermissionDto,
            )
        return chatPermissions
    }
}
