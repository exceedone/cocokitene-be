import { Meeting } from '@entities/meeting.entity'
import {
    ParticipantDetailMeeting,
    personnelVotingDetailMeeting,
    ProposalItemDetailMeeting,
} from '../meetings/meeting.interface'

export interface DetailBoardMeetingResponse
    extends Omit<Partial<Meeting>, 'personnelVoting'> {
    boardsTotal: number
    boardsJoined: number
    participants: ParticipantDetailMeeting[]
    proposals: ProposalItemDetailMeeting[]
    personnelVoting: personnelVotingDetailMeeting[]
}
