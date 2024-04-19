import { Injectable } from '@nestjs/common'
import { MeetingRoleMtgRepository } from '@repositories/meeting-role-mtg.repository'
import { CreateMeetingRoleMtgDto } from '@dtos/meeting-role-mtg.dto'
import { MeetingRoleMtg } from '@entities/meeting-role-mtg.entity'

@Injectable()
export class MeetingRoleMtgService {
    constructor(
        private readonly meetingRoleMtgRepository: MeetingRoleMtgRepository,
    ) {}

    async getRoleMtgByMeetingId(meetingId: number) {
        const meetingRoleMtg = await this.getMeetingRoleMtgByMeetingId(
            meetingId,
        )

        const roleMtgs = meetingRoleMtg
            .map((item) => item.roleMtg)
            .sort((a, b) => a.roleName.localeCompare(b.roleName))

        return roleMtgs
    }
    async getMeetingRoleMtgByMeetingId(
        meetingId: number,
    ): Promise<MeetingRoleMtg[]> {
        const meetingRoleMtgs =
            await this.meetingRoleMtgRepository.getRoleMtgsByMeetingId(
                meetingId,
            )
        // const roleMeetingIds = meetingRoleMtgs.map(
        //     (meetingRoleMtg) => meetingRoleMtg.roleMtgId,
        // )
        return meetingRoleMtgs
    }
    async getRoleMtgNamesByMeetingId(meetingId: number): Promise<string[]> {
        const meetingRoleMtgs =
            await this.meetingRoleMtgRepository.getRoleMtgsByMeetingId(
                meetingId,
            )

        const roleMeetingIds = meetingRoleMtgs.map(
            (meetingRoleMtg) => meetingRoleMtg.roleMtg.roleName,
        )
        return roleMeetingIds
    }
    async createMeetingRoleMtg(
        createMeetingRoleMtgDto: CreateMeetingRoleMtgDto,
    ): Promise<MeetingRoleMtg> {
        const createdMeetingRoleMtg =
            await this.meetingRoleMtgRepository.createMeetingRoleMtg(
                createMeetingRoleMtgDto,
            )
        return createdMeetingRoleMtg
    }
}
