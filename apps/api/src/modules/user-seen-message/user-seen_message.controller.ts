import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'
import { UserSeenMessageService } from './user-seen-message.service'
import { UpdateLastMessageUserSeenDto } from '@dtos/message.dto'

@Controller('user-seen-message')
@ApiTags('user-seen-message')
export class UserSeenMessageController {
    constructor(
        private readonly userSeenMessageService: UserSeenMessageService,
    ) {}

    @Get('/meeting/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_MEETING)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async getUserSeenMessage(
        @Param('id') meetingId: number,
        @UserScope() user: User,
    ) {
        const userId = user.id
        const lastMessageSeen =
            await this.userSeenMessageService.getLastMessageUserSeenByMeetingId(
                userId,
                meetingId,
            )
        return lastMessageSeen
    }

    @Patch('/meeting/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_MEETING)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateLastMessageUserSeen(
        @Param('id') meetingId: number,
        @Body() updateLastMessageUserSeenDto: UpdateLastMessageUserSeenDto,
        @UserScope() user: User,
    ) {
        const userId = user.id
        const { lastMessageIdSeen } = updateLastMessageUserSeenDto

        const lastMessageSeen =
            await this.userSeenMessageService.updateLastMessageUserSeen(
                userId,
                meetingId,
                lastMessageIdSeen,
            )

        return lastMessageSeen
    }
}
