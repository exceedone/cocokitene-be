import { Meeting } from '@entities/meeting.entity'
import {
    FileTypes,
    MeetingRole,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { SupportedChainId } from '@shares/constants'
import { VoteProposalResult } from '@shares/constants/proposal.const'

export interface participant {
    meetingId: number
    userId: number
    username: string
    role: MeetingRole
    status: UserMeetingStatusEnum
}
export interface ResultVoteProposal {
    meetingId: number
    proposalId: number
    titleProposal: string
    votedQuantity: number
    unVotedQuantity: number
    notVoteYetQuantity: number
}
export interface ResultVoting {
    userId: number
    votingId: number
    result: VoteProposalResult
    proposalId: number
}

export interface ListFileOfProposal {
    meetingId: number
    proposalFileId: number
    proposalId: number
    url: string
}
export interface ListFileOfMeeting {
    meetingId: number
    meetingFileId: number
    url: string
    type: FileTypes
}

export interface MeetingEnded extends Partial<Meeting> {
    meetingId: number
    companyId: number
    titleMeeting: string
    startTimeMeeting: number
    endTimeMeeting: number
    meetingLink: string
    participants: participant[]
    listResultProposals: ResultVoteProposal[]
    listResultProposalFiles: ListFileOfProposal[]
    listResultVotings: ResultVoting[]
    listResultMeetingFiles: ListFileOfMeeting[]
    shareholdersTotal: number
    shareholdersJoined: number
    joinedMeetingShares: number
    totalMeetingShares: number
}

export interface ConfigCrawler {
    contract: string
    provider: string
    chainId: SupportedChainId
    abi: any
    startBlock: number
    name: string
}
