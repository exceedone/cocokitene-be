import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PermissionEnum } from '@shares/constants'
import {
    GetAllMeetingInDayDto,
    StatisticMeetingInMonthDto,
} from '@dtos/meeting.dto'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { Permission } from '@shares/decorators/permission.decorator'
import { DashBoardService } from './dash-board.service'
import { getAllSysNotificationDto } from '@dtos/system-notification.dto'

@Controller('dash-board')
@ApiTags('dash-board')
export class DashBoardController {
    constructor(private readonly dashBoardService: DashBoardService) {}
    @Get('/meeting-in-day')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.BASIC_PERMISSION)
    async getAllMeetingsByDate(
        @Query() getAllMeetingInDayDto: GetAllMeetingInDayDto,
        @UserScope() user: User,
    ) {
        const companyId = user.companyId

        const meetings = await this.dashBoardService.getAllMeetingInDay(
            getAllMeetingInDayDto,
            user,
            companyId,
        )
        return meetings
    }

    @Get('/meeting-in-month/statistics')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async statisticsMeetingInMonth(
        @Query() statisticMeetingInDayQuery: StatisticMeetingInMonthDto,
        @UserScope() user: User,
    ) {
        const statisticMeetingInMonth =
            await this.dashBoardService.getStatisticMeetingInMonth(
                statisticMeetingInDayQuery,
                user,
            )

        return statisticMeetingInMonth
    }

    @Get('/system-notification')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.BASIC_PERMISSION)
    async getAllSysNotification(
        @Query() getAllSysNotification: getAllSysNotificationDto,
    ) {
        const sysNotification = this.dashBoardService.getAllSysNotification(
            getAllSysNotification,
        )

        return sysNotification
    }
}
