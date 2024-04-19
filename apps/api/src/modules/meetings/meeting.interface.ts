import { Meeting } from '@entities/meeting.entity'
import { Proposal } from '@entities/proposal.entity'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { UserMeetingStatusEnum } from '@shares/constants/meeting.const'

export interface ProposalItemDetailMeeting extends Proposal {
    voteResult: VoteProposalResult
}

export interface ParticipantView {
    userId: number
    userDefaultAvatarHashColor: string
    userAvatar: string
    userEmail: string
    userJoined: boolean
    status: UserMeetingStatusEnum
    userShareQuantity: number
}

export interface ParticipantDetailMeeting {
    roleMtgId: number
    roleMtgName: string
    userParticipants: ParticipantView[]
}

export interface DetailMeetingResponse extends Partial<Meeting> {
    participants: ParticipantDetailMeeting[]
    shareholdersTotal: number
    shareholdersJoined: number
    joinedMeetingShares: number
    totalMeetingShares: number
    proposals: ProposalItemDetailMeeting[]
}

export interface ParticipantMeeting {
    userWithRoleMtg: ParticipantDetailMeeting[]
}
