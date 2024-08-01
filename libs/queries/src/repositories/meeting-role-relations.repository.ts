import { Repository } from 'typeorm'
import { MeetingRoleMtg } from '@entities/meeting-role-relations.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateMeetingRoleMtgDto } from '@dtos/meeting-role-mtg.dto'

@CustomRepository(MeetingRoleMtg)
export class MeetingRoleMtgRepository extends Repository<MeetingRoleMtg> {
    async getRoleMtgsByMeetingId(meetingId: number): Promise<MeetingRoleMtg[]> {
        const meetingRoleMtgs = await this.find({
            where: {
                meetingId: meetingId,
            },
            relations: ['roleMtg'],
        })
        return meetingRoleMtgs
    }

    async createMeetingRoleMtg(
        createMeetingRoleMtgDto: CreateMeetingRoleMtgDto,
    ): Promise<MeetingRoleMtg> {
        const { roleMtgId, meetingId } = createMeetingRoleMtgDto
        const createdMeetingRoleMtg = await this.create({
            roleMtgId: roleMtgId,
            meetingId: meetingId,
        })
        await createdMeetingRoleMtg.save()
        return createdMeetingRoleMtg
    }
}
