import { Meeting } from '@entities/meeting.entity'
import {
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common'
import { MeetingRepository } from '@repositories/meeting.repository'
import {
    StatusMeeting,
} from '@shares/constants/meeting.const'
import { httpErrors } from '@shares/exception-filter'
import { Pagination } from 'nestjs-typeorm-paginate'
import { GetAllMeetingDto } from '@dtos/meeting.dto'
import { User } from '@entities/user.entity'
import { PermissionEnum } from '@shares/constants'

@Injectable()
export class BoardMeetingService {
    constructor(
        private readonly boardMeetingRepository: MeetingRepository,
    ) {}

    async getAllBoardMeeting(
        getAllBoardMeetingDto: GetAllMeetingDto,
        user: User,
        companyId: number,
    ): Promise<Pagination<Meeting>> {
        const listBoardMeetingResponse =
            await this.boardMeetingRepository.getInternalListMeeting(
                companyId,
                getAllBoardMeetingDto,
            )

        const idOfMeetings = listBoardMeetingResponse.map(
            (meeting) => meeting.id,
        )

        await Promise.all([
            ...idOfMeetings.map((id) => this.standardStatusMeeting(id)),
        ])
        const userId = user.id
        const permissionKeys: string[] = (user as any).permissionKeys || []
        const canUserCreateBoardMeeting = permissionKeys.includes(
            PermissionEnum.CREATE_BOARD_MEETING,
        )

        const boardMeetings = await this.boardMeetingRepository.getAllMeetings(
            companyId,
            userId,
            canUserCreateBoardMeeting,
            getAllBoardMeetingDto,
        )

        return boardMeetings
    }

    async standardStatusMeeting(meetingId: number): Promise<Meeting> {
        const existedMeeting =
            await this.boardMeetingRepository.getInternalMeetingById(meetingId)
        if (!existedMeeting) {
            throw new HttpException(
                httpErrors.MEETING_NOT_EXISTED,
                HttpStatus.BAD_REQUEST,
            )
        }
        if (
            existedMeeting.status === StatusMeeting.DELAYED ||
            existedMeeting.status === StatusMeeting.CANCELED
        ) {
            return existedMeeting
        }
        const currenDate = new Date()
        const startTimeMeeting = new Date(existedMeeting.startTime)
        const endTimeMeeting = new Date(existedMeeting.endTime)
        if (currenDate < startTimeMeeting) {
            existedMeeting.status = StatusMeeting.NOT_HAPPEN
        } else if (
            currenDate >= startTimeMeeting &&
            currenDate <= endTimeMeeting
        ) {
            existedMeeting.status = StatusMeeting.HAPPENING
        } else if (currenDate > endTimeMeeting) {
            existedMeeting.status = StatusMeeting.HAPPENED
        }
        await existedMeeting.save()
        return existedMeeting
    }
}
