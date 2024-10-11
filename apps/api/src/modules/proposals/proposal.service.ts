import {
    CreateProposalDto,
    GetAllProposalDto,
    ProposalDto,
} from '@dtos/proposal.dto'
import { Proposal } from '@entities/meeting-proposal.entity'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { ProposalRepository } from '@repositories/meeting-proposal.repository'
import { httpErrors } from '@shares/exception-filter'
import { VotingService } from '@api/modules/votings/voting.service'
import { MeetingService } from '@api/modules/meetings/meeting.service'
import { ProposalFileService } from '@api/modules/proposal-files/proposal-file.service'
import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { CalculateProposal } from '@api/modules/proposals/proposal.interface'
import { Logger } from 'winston'
import { UserMeeting } from '@entities/meeting-participant.entity'
@Injectable()
export class ProposalService {
    constructor(
        private readonly proposalRepository: ProposalRepository,
        private readonly votingService: VotingService,
        @Inject(forwardRef(() => MeetingService))
        private readonly meetingService: MeetingService,
        private readonly proposalFileService: ProposalFileService,
        private readonly userMeetingService: UserMeetingService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async createProposal(
        createProposalDto: CreateProposalDto,
    ): Promise<Proposal> {
        const {
            title,
            description,
            oldDescription,
            type,
            creatorId,
            meetingId,
            notVoteYetQuantity,
            files,
        } = createProposalDto
        try {
            const createdProposal =
                await this.proposalRepository.createProposal({
                    title,
                    description,
                    oldDescription,
                    type,
                    creatorId,
                    meetingId,
                    notVoteYetQuantity,
                })

            if (files && files.length > 0) {
                await Promise.all([
                    ...files.map((file) =>
                        this.proposalFileService.createProposalFile({
                            url: file.url,
                            proposalId: createdProposal.id,
                        }),
                    ),
                ])
            }

            return createdProposal
        } catch (error) {
            // this.logger.error('Proposal create failed. Please try again')
            throw new HttpException(
                httpErrors.PROPOSAL_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async deleteProposal(companyId: number, proposalId: number) {
        // check existed of meeting and proposal
        const proposal = await this.proposalRepository.getProposalById(
            proposalId,
        )
        if (!proposal) {
            throw new HttpException(
                httpErrors.PROPOSAL_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        if (proposal.meeting.companyId !== companyId) {
            throw new HttpException(
                httpErrors.MEETING_NOT_IN_THIS_COMPANY,
                HttpStatus.BAD_REQUEST,
            )
        }

        try {
            //delete proposal
            const meetingId = proposal.meeting.id
            await this.proposalRepository.softDelete({
                meetingId,
                id: proposalId,
            })
            //join voting and delete relate idProposal
            await this.votingService.deleteVoting(proposalId)
            //delete meeting file
            await this.proposalFileService.deleteAllProposalFiles(proposalId)

            return `proposal with Id ${proposalId} deleted successfully`
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async getAllProposal(
        meetingId: number,
        userId: number,
        getAllProposalDto: GetAllProposalDto,
    ) {
        const proposals = await this.proposalRepository.getAllProposals(
            meetingId,
            userId,
            getAllProposalDto,
        )

        return proposals
    }

    async updateListProposals(
        meetingId: number,
        companyId: number,
        userId: number,
        proposals: ProposalDto[],
        totalShares: number,
        shareholders: number[],
        roleMtgShareholderId: number,
    ): Promise<void> {
        const meeting = await this.meetingService.getInternalMeetingById(
            meetingId,
        )
        const listCurrentProposals = meeting.proposals
        // list edited
        //List Proposal New
        const listEdited = proposals.filter((proposal) => !!proposal.id)

        const listEditedIds = listEdited.map((proposal) => proposal.id)
        // list deleted
        const listDeleted = listCurrentProposals.filter(
            (proposal) => !listEditedIds.includes(proposal.id),
        )

        // list added
        const listAdded = proposals.filter((proposal) => !proposal.id)

        //Get User(Active) out meeting
        const usersToRemoves =
            await this.userMeetingService.getListUserToRemoveInMeeting(
                meetingId,
                shareholders,
                roleMtgShareholderId,
            )

        try {
            await Promise.all([
                ...listEdited.map(async (proposal) => {
                    const {
                        votedQuantity,
                        unVotedQuantity,
                        notVoteYetQuantity,
                    } = await this.recalculateVoteResult(
                        proposal,
                        usersToRemoves,
                        totalShares,
                    )
                    proposal.votedQuantity = votedQuantity
                    proposal.unVotedQuantity = unVotedQuantity
                    proposal.notVoteYetQuantity = notVoteYetQuantity
                    await this.proposalRepository.updateProposal(
                        proposal.id,
                        proposal,
                    )
                }),
                ...listEdited.map((proposal) =>
                    this.proposalFileService.updateListProposalFiles(
                        proposal.id,
                        proposal.files,
                    ),
                ),
                ...listDeleted.map((proposal) =>
                    this.deleteProposal(meeting.companyId, proposal.id),
                ),
                ...listAdded.map((proposal) =>
                    this.createProposal({
                        title: proposal.title,
                        description: proposal.description,
                        oldDescription: proposal.oldDescription,
                        type: proposal.type,
                        creatorId: userId,
                        meetingId,
                        notVoteYetQuantity: totalShares,
                        files: proposal.files,
                    }),
                ),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async getInternalProposalById(proposalId: number): Promise<Proposal> {
        const proposal = await this.proposalRepository.getInternalProposalById(
            proposalId,
        )
        return proposal
    }

    async recalculateVoteResult(
        proposal: ProposalDto,
        usersToRemoves: UserMeeting[],
        totalShares: number,
    ): Promise<CalculateProposal> {
        let votedQuantity = 0,
            unVotedQuantity = 0,
            notVoteYetQuantity = 0
        let temporaryVoteQuantity = 0,
            temporaryUnvoteQuantity = 0
        const currentProposal =
            await this.proposalRepository.getProposalByProposalId(proposal.id)

        await Promise.all([
            ...usersToRemoves.map(async (user) => {
                //handle check result voted by user
                const resultVotedByUser =
                    await this.votingService.findVotingByUserIdAndProposalId(
                        user.userId,
                        currentProposal.id,
                    )
                if (!resultVotedByUser) {
                    return
                } else {
                    const result = resultVotedByUser.result
                    switch (result) {
                        case VoteProposalResult.VOTE:
                            temporaryVoteQuantity += user.quantityShare
                            break
                        case VoteProposalResult.UNVOTE:
                            temporaryUnvoteQuantity += user.quantityShare
                            break
                    }
                    await this.votingService.removeUserVoting(
                        user.userId,
                        currentProposal.id,
                    )
                }
            }),
        ])
        votedQuantity =
            currentProposal.votedQuantity !== null
                ? currentProposal.votedQuantity - temporaryVoteQuantity
                : 0
        unVotedQuantity =
            currentProposal.unVotedQuantity !== null
                ? currentProposal.unVotedQuantity - temporaryUnvoteQuantity
                : 0
        notVoteYetQuantity = totalShares - votedQuantity - unVotedQuantity
        return {
            votedQuantity,
            unVotedQuantity,
            notVoteYetQuantity,
        }
    }

    async getInternalListProposalByMeetingId(
        meetingId: number,
    ): Promise<Proposal[]> {
        const listProposals =
            await this.proposalRepository.getInternalListProposalByMeetingId(
                meetingId,
            )
        return listProposals
    }

    async updateListProposalBoardMtg(
        meetingId: number,
        userId: number,
        proposals: ProposalDto[],
        boardIdActiveRemoveMeeting: number[],
        totalVoter: number,
    ) {
        const boardMeeting = await this.meetingService.getInternalMeetingById(
            meetingId,
        )
        const listCurrentProposals = boardMeeting.proposals

        //List Coming Proposals
        const listProposalsEdited = proposals.filter(
            (proposal) => !!proposal.id,
        )
        const listProposalEditedIds = listProposalsEdited.map(
            (proposal) => proposal.id,
        )

        //List Proposal Deleted
        const listProposalDeleted = listCurrentProposals.filter(
            (proposal) => !listProposalEditedIds.includes(proposal.id),
        )

        //List Proposals Added
        const listProposalsAdded = proposals.filter((proposal) => !proposal.id)

        //
        try {
            await Promise.all([
                ...listProposalsEdited.map(async (proposal) => {
                    const {
                        votedQuantity,
                        unVotedQuantity,
                        notVoteYetQuantity,
                    } = await this.reCalculateVoteBoardProposal(
                        proposal,
                        boardIdActiveRemoveMeeting,
                        totalVoter,
                    )
                    ;(proposal.votedQuantity = votedQuantity),
                        (proposal.unVotedQuantity = unVotedQuantity),
                        (proposal.notVoteYetQuantity = notVoteYetQuantity),
                        await this.proposalRepository.updateProposal(
                            proposal.id,
                            proposal,
                        )
                }),

                ...listProposalsEdited.map((proposal) =>
                    this.proposalFileService.updateListProposalFiles(
                        proposal.id,
                        proposal.files,
                    ),
                ),

                ...listProposalDeleted.map((proposal) =>
                    this.deleteProposal(boardMeeting.companyId, proposal.id),
                ),

                ...listProposalsAdded.map((proposal) =>
                    this.createProposal({
                        title: proposal.title,
                        description: proposal.description,
                        oldDescription: proposal.oldDescription,
                        type: proposal.type,
                        creatorId: userId,
                        meetingId,
                        notVoteYetQuantity: totalVoter,
                        files: proposal.files,
                    }),
                ),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async reCalculateVoteBoardProposal(
        proposal: ProposalDto,
        boardIdActiveRemoveMeeting: number[],
        totalVoter: number,
    ): Promise<CalculateProposal> {
        let votedQuantity = 0,
            unVotedQuantity = 0,
            notVoteYetQuantity = 0,
            temporaryVoteQuantity = 0,
            temporaryUnVoteQuantity = 0

        const currentProposal = await this.proposalRepository.getProposalById(
            proposal.id,
        )

        await Promise.all([
            ...boardIdActiveRemoveMeeting.map(async (boardId) => {
                //Check board is voted
                const resultVotedByBoard =
                    await this.votingService.findVotingByUserIdAndProposalId(
                        boardId,
                        currentProposal.id,
                    )
                if (!resultVotedByBoard) {
                    return
                } else {
                    const resultVoted = resultVotedByBoard.result
                    switch (resultVoted) {
                        case VoteProposalResult.VOTE:
                            temporaryVoteQuantity += 1
                            break
                        case VoteProposalResult.UNVOTE:
                            temporaryUnVoteQuantity += 1
                            break
                    }
                    await this.votingService.removeUserVoting(
                        boardId,
                        currentProposal.id,
                    )
                }
            }),
        ])

        votedQuantity =
            currentProposal.votedQuantity !== null
                ? currentProposal.votedQuantity - temporaryVoteQuantity
                : 0
        unVotedQuantity =
            currentProposal.unVotedQuantity !== null
                ? currentProposal.unVotedQuantity - temporaryUnVoteQuantity
                : 0
        notVoteYetQuantity = totalVoter - votedQuantity - unVotedQuantity

        return {
            votedQuantity,
            unVotedQuantity,
            notVoteYetQuantity,
        }
    }
}
