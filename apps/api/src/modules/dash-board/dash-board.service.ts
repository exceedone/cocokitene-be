import { getAllSysNotificationDto } from './../../../../../libs/queries/src/dtos/system-notification.dto'
import { Injectable } from '@nestjs/common'
import { MeetingService } from '../meetings/meeting.service'
import {
    GetAllMeetingInDayDto,
    StatisticMeetingInMonthDto,
} from '@dtos/meeting.dto'
import { User } from '@entities/user.entity'
import { Pagination } from 'nestjs-typeorm-paginate'
import { Meeting } from '@entities/meeting.entity'
import {
    MeetingType,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { PermissionEnum } from '@shares/constants'
import { SystemNotification } from '@entities/system-notification.entity'
import { SystemNotificationService } from '../system-notification/system-notification.service'

@Injectable()
export class DashBoardService {
    constructor(
        private readonly meetingService: MeetingService,
        private readonly systemNotificationService: SystemNotificationService,
    ) {}

    async getAllMeetingInDay(
        getAllMeetingInDayDto: GetAllMeetingInDayDto,
        user: User,
        companyId: number,
    ): Promise<Pagination<Meeting>> {
        const permissionKeys: string[] = (user as any).permissionKeys || []
        const canUserCreateMeeting = permissionKeys.includes(
            PermissionEnum.CREATE_MEETING,
        )

        const meetingInDay = await this.meetingService.getAllMeetingsInDay(
            getAllMeetingInDayDto,
            user,
            companyId,
            canUserCreateMeeting,
        )
        return meetingInDay
    }

    async getStatisticMeetingInMonth(
        statisticMeetingInDayQuery: StatisticMeetingInMonthDto,
        user: User,
    ) {
        const shareholderMeetingInMonth =
            await this.meetingService.getMeetingInMonth(
                statisticMeetingInDayQuery,
                user,
                MeetingType.SHAREHOLDER_MEETING,
            )

        const filterUniqueParticipant = shareholderMeetingInMonth
            .flatMap((meeting) => meeting.participant)
            .reduce(
                (acc, current) => {
                    const checkExist = acc.participant.some(
                        (participant) =>
                            participant.userId === current.userId &&
                            participant.meetingId == current.meetingId,
                    )
                    if (!checkExist) {
                        if (
                            current.status == UserMeetingStatusEnum.PARTICIPATE
                        ) {
                            return {
                                participant: acc.participant.concat([current]),
                                totalShareholderJoined:
                                    acc.totalShareholderJoined + 1,
                            }
                        }
                        return {
                            ...acc,
                            participant: acc.participant.concat([current]),
                        }
                    }
                    return acc
                },
                {
                    participant: [],
                    totalShareholderJoined: 0,
                },
            )

        const boardMeetingInMonth = await this.meetingService.getMeetingInMonth(
            statisticMeetingInDayQuery,
            user,
            MeetingType.BOARD_MEETING,
        )

        const filterUniqueBoard = boardMeetingInMonth
            .flatMap((meeting) => meeting.participant)
            .reduce(
                (acc, current) => {
                    const checkExist = acc.participant.some(
                        (participant) =>
                            participant.userId === current.userId &&
                            participant.meetingId == current.meetingId,
                    )
                    if (!checkExist) {
                        if (
                            current.status == UserMeetingStatusEnum.PARTICIPATE
                        ) {
                            return {
                                participant: acc.participant.concat([current]),
                                totalBoardJoined: acc.totalBoardJoined + 1,
                            }
                        }
                        return {
                            ...acc,
                            participant: acc.participant.concat([current]),
                        }
                    }
                    return acc
                },
                {
                    participant: [],
                    totalBoardJoined: 0,
                },
            )

        return {
            shareholderMeetingInMonth: {
                totalMeeting: shareholderMeetingInMonth.length,
                totalParticipant: filterUniqueParticipant.participant.length,
                totalParticipantJoined:
                    filterUniqueParticipant.totalShareholderJoined,
            },
            boardMeetingInMonth: {
                totalMeeting: boardMeetingInMonth.length,
                totalParticipant: filterUniqueBoard.participant.length,
                totalParticipantJoined: filterUniqueBoard.totalBoardJoined,
            },
        }
    }

    async getAllSysNotification(
        getAllSysNotificationDto: getAllSysNotificationDto,
    ): Promise<Pagination<SystemNotification>> {
        const sysNotification =
            this.systemNotificationService.getAllSystemNotification(
                getAllSysNotificationDto,
            )

        return sysNotification
    }
}
