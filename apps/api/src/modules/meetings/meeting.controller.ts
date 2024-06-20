import {
    Body,
    Controller,
    forwardRef,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { MeetingService } from '@api/modules/meetings/meeting.service'
import { User } from '@entities/user.entity'
import { EmailService } from '@api/modules/emails/email.service'
import {
    AttendMeetingDto,
    CreateMeetingDto,
    GetAllMeetingDto,
    UpdateMeetingDto,
} from 'libs/queries/src/dtos/meeting.dto'
import { UserScope } from '@shares/decorators/user.decorator'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants/permission.const'
import { GetAllDto } from '@dtos/base.dto'
import { MeetingRoleMtgService } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.service'
import { PermissionChatInMeetingDto } from '@dtos/chat-permission.dto'

@Controller('meetings')
@ApiTags('meetings')
export class MeetingController {
    constructor(
        private readonly meetingService: MeetingService,
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
    ) {}

    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SHAREHOLDERS_MTG)
    async getAllMeetings(
        @Query() getAllMeetingDto: GetAllMeetingDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        // const userId = user?.id
        const meetings = await this.meetingService.getAllMeetings(
            getAllMeetingDto,
            user,
            companyId,
        )
        return meetings
    }

    @Post('/send-email/meeting/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @Permission(PermissionEnum.SEND_MAIL_TO_SHAREHOLDER)
    async sendEmailToShareHolder(
        @Param('id') meetingId: number,
        @UserScope() user: User,
    ) {
        const companyId = user.companyId
        await this.emailService.sendEmailMeeting(meetingId, companyId)
        return 'Emails sent successfully'
    }

    @Post('/attendance-meeting')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @Permission(PermissionEnum.SHAREHOLDERS_MTG)
    async userAttendanceMeeting(
        @Body() attendMeetingDto: AttendMeetingDto,
        @UserScope() user: User,
    ) {
        const userId = user.id
        const companyId = user?.companyId
        const userMeetingData = await this.meetingService.attendanceMeeting(
            attendMeetingDto,
            userId,
            companyId,
        )
        return userMeetingData
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @Permission(PermissionEnum.CREATE_MEETING)
    async createMeeting(
        @Body() createMeetingDto: CreateMeetingDto,
        @UserScope() user: User,
    ) {
        const userId = user?.id
        const companyId = user?.companyId

        const meeting = await this.meetingService.createMeeting(
            createMeetingDto,
            userId,
            companyId,
        )
        return meeting
    }

    @Get('/:id/participants')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_MEETING)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getMeetingParticipants(
        @Param('id') meetingId: number,
        @Query() filter: GetAllDto,
        // @UserScope() user: User,
    ) {
        return this.meetingService.getAllMeetingParticipant(meetingId, filter)
    }

    @Get('/:id/participants-invite')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_MEETING)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getAllParticipantInviteMeeting(@Param('id') meetingId: number) {
        return this.meetingService.getAllParticipantInviteMeeting(meetingId)
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_MEETING)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getMeetingById(
        @Param('id') meetingId: number,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const userId = user?.id

        const meeting = await this.meetingService.getMeetingById(
            meetingId,
            companyId,
            userId,
        )
        return meeting
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.EDIT_MEETING)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateMeeting(
        @Param('id') meetingId: number,
        @Body() updateMeetingDto: UpdateMeetingDto,
        @UserScope() user: User,
    ) {
        const userId = user?.id
        const companyId = user?.companyId
        const meeting = await this.meetingService.updateMeeting(
            meetingId,
            updateMeetingDto,
            userId,
            companyId,
        )
        return meeting
    }

    @Get('/:id/roleMtgs')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async getRoleMtgByMeetingId(@Param('id') meetingId: number) {
        try {
            const roleMtgs =
                await this.meetingRoleMtgService.getRoleMtgByMeetingId(
                    meetingId,
                )
            return roleMtgs
        } catch (error) {
            console.log(error)
        }
    }

    @Patch('/:id/changePermissionChat')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Permission(PermissionEnum.EDIT_MEETING)
    @HttpCode(HttpStatus.OK)
    async updatePermissionChat(
        @Param('id') meetingId: number,
        @Body() permissionChatDto: PermissionChatInMeetingDto,
        @UserScope() user: User,
    ) {
        const userId = user.id
        const companyId = user.companyId
        const { permissionChatId } = permissionChatDto
        const permissionChat =
            await this.meetingService.changePermissionChatInMeeting(
                userId,
                meetingId,
                companyId,
                permissionChatId,
            )

        return permissionChat
    }
}
