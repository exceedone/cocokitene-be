import { Meeting } from '@entities/meeting.entity'
import { Proposal } from '@entities/meeting-proposal.entity'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import {
    FileTypes,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { Candidate } from '@entities/nominees.entity'

export interface ProposalItemDetailMeeting extends Proposal {
    voteResult: VoteProposalResult
}

export interface CandidateItemDetailMeeting extends Candidate {
    voteResult: VoteProposalResult
    votedQuantityShare: number
}

// export interface PersonnelVotingDetailMeeting extends PersonnelVoting {
//     candidate: CandidateItemDetailMeeting[]
// }

export interface personnelVotingDetailMeeting {
    id: number
    title: string
    type: number
    meetingId: number
    candidate: CandidateItemDetailMeeting[]
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

export interface DetailMeetingResponse
    extends Omit<Partial<Meeting>, 'personnelVoting'> {
    participants: ParticipantDetailMeeting[]
    shareholdersTotal: number
    shareholdersJoined: number
    joinedMeetingShares: number
    totalMeetingShares: number
    proposals: ProposalItemDetailMeeting[]
    personnelVoting: personnelVotingDetailMeeting[]
}

export interface ParticipantMeeting {
    userWithRoleMtg: ParticipantDetailMeeting[]
}

export interface calculateVoter {
    voterTotal: number
    voterJoined: number
    totalMeetingVote: number
    joinedMeetingVote: number
}

export interface ListFileOfMeeting {
    meetingId: number
    meetingFileId: number
    url: string
    type: FileTypes
}
