/* eslint-disable @typescript-eslint/no-unused-vars */

import {
    Controller,
    Post,
    UseGuards,
    HttpCode,
    HttpStatus,
    Body,
    Get,
    Query,
    Param,
    Patch,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { BoardMeetingService } from './board-meeting.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { PermissionEnum } from '@shares/constants/permission.const'
import { Permission } from '@shares/decorators/permission.decorator'
import {
    CreateBoardMeetingDto,
    UpdateBoardMeetingDto,
} from '@dtos/board-meeting.dto'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'
import { GetAllMeetingDto } from '@dtos/meeting.dto'
import { EmailService } from '../emails/email.service'
import { MeetingService } from '../meetings/meeting.service'

@Controller('board-meetings')
@ApiTags('board-meetings')
export class BoardMeetingController {
    constructor(
        private readonly boardMeetingService: BoardMeetingService,
        private readonly emailService: EmailService,
        private readonly meetingService: MeetingService,
    ) {}

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

    @Post('')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @Permission(PermissionEnum.CREATE_BOARD_MEETING)
    async createBoardMeeting(
        @Body() createBoardMeetingDto: CreateBoardMeetingDto,
        @UserScope() user: User,
    ) {
        const userId = +user?.id
        const companyId = user?.companyId

        const boardMeeting = await this.boardMeetingService.createBoardMeeting(
            createBoardMeetingDto,
            userId,
            companyId,
        )
        return boardMeeting
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(
        PermissionEnum.DETAIL_BOARD_MEETING,
        PermissionEnum.EDIT_BOARD_MEETING,
    )
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getBoardMeetingById(
        @Param('id') meetingId: number,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const userId = user?.id

        const boardMeeting = await this.boardMeetingService.getBoardMeetingById(
            meetingId,
            companyId,
            userId,
            user,
        )

        return boardMeeting
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.EDIT_BOARD_MEETING)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateBoardMeeting(
        @Param('id') boardMeetingId: number,
        @Body() updateBoardMeetingDto: UpdateBoardMeetingDto,
        @UserScope() user: User,
    ) {
        const userId = user?.id
        const companyId = user?.companyId

        const boardMeeting = await this.boardMeetingService.updateBoardMeeting(
            userId,
            companyId,
            boardMeetingId,
            updateBoardMeetingDto,
        )

        return boardMeeting
    }

    // Send Email to Board of Board Meeting
    @Post('/send-email/board-meeting/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @Permission(PermissionEnum.SEND_MAIL_TO_BOARD)
    async sendEmailToBoard(
        @Param('id') boardMeetingId: number,
        @UserScope() user: User,
    ) {
        const companyId = user.companyId
        await this.emailService.sendEmailBoardMeeting(boardMeetingId, companyId)

        return 'Email sent to Board successfully'
    }

    @Get('/:id/dataHash')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.BOARD_MEETING)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async getDataHashByMeetingId(
        @Param('id') meetingId: number,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const dataHash = await this.meetingService.getDataHashByMeetingId(
            meetingId,
            companyId,
        )
        return dataHash
    }
}
