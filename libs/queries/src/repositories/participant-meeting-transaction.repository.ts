import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { ParticipantMeetingTransaction } from '@entities/participant-meeting-transaction.entity'
import { ParticipantDto } from '@dtos/user-meeting.dto'

@CustomRepository(ParticipantMeetingTransaction)
export class ParticipantMeetingTransactionRepository extends Repository<ParticipantMeetingTransaction> {
    async createParticipantMeetingTransaction(
        participantDto: ParticipantDto,
    ): Promise<ParticipantMeetingTransaction> {
        const { username, userId, status, roleMtgId, meetingId } =
            participantDto

        const createParticipantMeetingTransaction = await this.create({
            meetingId,
            userId,
            username,
            status,
            roleMtgId,
        })
        return await createParticipantMeetingTransaction.save()
    }

    async getParticipantsMeetingTransactionsByMeetingId(
        meetingId: number,
    ): Promise<ParticipantMeetingTransaction[]> {
        const participantMeetings = await this.find({
            where: {
                meetingId: meetingId,
            },
        })
        return participantMeetings
    }
}
