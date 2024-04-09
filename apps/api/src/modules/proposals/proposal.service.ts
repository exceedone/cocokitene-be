import {
    CreateProposalDto,
    GetAllProposalDto,
    ProposalDto,
} from '@dtos/proposal.dto'
import { Proposal } from '@entities/proposal.entity'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { ProposalRepository } from '@repositories/proposal.repository'
import { httpErrors } from '@shares/exception-filter'
import { VotingService } from '@api/modules/votings/voting.service'
import { MeetingService } from '@api/modules/meetings/meeting.service'
import { ProposalFileService } from '@api/modules/proposal-files/proposal-file.service'
import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { CalculateProposal } from '@api/modules/proposals/proposal.interface'
import { User } from '@entities/user.entity'
import { Logger } from 'winston'
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
                console.log(files)

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
        userId: number,
        proposals: ProposalDto[],
        totalShares: number,
        shareholders: number[],
    ): Promise<void> {
        const meeting = await this.meetingService.getInternalMeetingById(
            meetingId,
        )
        const listCurrentProposals = meeting.proposals
        // list edited
        const listEdited = proposals.filter((proposal) => !!proposal.id)

        const listEditedIds = listEdited.map((proposal) => proposal.id)
        // list deleted
        const listDeleted = listCurrentProposals.filter(
            (proposal) => !listEditedIds.includes(proposal.id),
        )

        // list added
        const listAdded = proposals.filter((proposal) => !proposal.id)
        const usersToRemoves =
            await this.userMeetingService.getListUserToRemoveInMeeting(
                meetingId,
                shareholders,
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
        usersToRemoves: User[],
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
                        user.id,
                        currentProposal.id,
                    )
                if (!resultVotedByUser) {
                    return
                } else {
                    const result = resultVotedByUser.result
                    switch (result) {
                        case VoteProposalResult.VOTE:
                            temporaryVoteQuantity += user.shareQuantity
                            break
                        case VoteProposalResult.UNVOTE:
                            temporaryUnvoteQuantity += user.shareQuantity
                            break
                    }
                    await this.votingService.removeUserVoting(
                        user.id,
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
}
