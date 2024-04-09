import {
    Controller,
    UseGuards,
    HttpCode,
    HttpStatus,
    Get,
    Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { BoardMeetingService } from './board-meeting.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { PermissionEnum } from '@shares/constants/permission.const'
import { Permission } from '@shares/decorators/permission.decorator'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'
import { GetAllMeetingDto } from '@dtos/meeting.dto'

@Controller('board-meetings')
@ApiTags('board-meetings')
export class BoardMeetingController {
    constructor(private readonly boardMeetingService: BoardMeetingService) {}

    @Get('')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @Permission(PermissionEnum.BOARD_MEETING)
    async getAllBoardMeeting(
        @Query() getAllBoardMeetingDto: GetAllMeetingDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId

        const boardMeetings = await this.boardMeetingService.getAllBoardMeeting(
            getAllBoardMeetingDto,
            user,
            companyId,
        )
        return boardMeetings
    }
}
