import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { VotingRepository } from '@repositories/voting.repository'
import { ProposalRepository } from '@repositories/proposal.repository'
import { Voting } from '@entities/voting.entity'
import { VoteProposalDto } from '@dtos/voting.dto'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { Proposal } from '@entities/proposal.entity'
import { UserService } from '@api/modules/users/user.service'
import { MeetingService } from '@api/modules/meetings/meeting.service'
import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { UserMeetingStatusEnum } from '@shares/constants/meeting.const'
import { Logger } from 'winston'
import { RoleMtgEnum } from '@shares/constants'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'
import { MeetingRoleMtgService } from '../meeting-role-mtgs/meeting-role-mtg.service'

@Injectable()
export class VotingService {
    constructor(
        private readonly votingRepository: VotingRepository,
        private readonly proposalRepository: ProposalRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly userMeetingService: UserMeetingService,
        @Inject(forwardRef(() => MeetingService))
        private readonly meetingService: MeetingService,
        private readonly roleMtgService: RoleMtgService,
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async findVotingByUserIdAndProposalId(
        userId: number,
        proposalId: number,
    ): Promise<Voting> {
        const existedVoting = await this.votingRepository.findOne({
            where: {
                userId: userId,
                proposalId: proposalId,
            },
        })
        return existedVoting
    }

    async voteProposal(
        companyId: number,
        userId: number,
        proposalId: number,
        voteProposalDto: VoteProposalDto,
    ): Promise<Proposal> {
        const { result } = voteProposalDto
        const roleMtgShareholder =
            await this.roleMtgService.getRoleMtgByNameAndCompanyId(
                RoleMtgEnum.SHAREHOLDER,
                companyId,
            )
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

        // const existedUser = await this.userService.getActiveUserById(userId)
        const existedUser =
            await this.userMeetingService.getParticipantInMeeting(
                proposal.meetingId,
                userId,
                roleMtgShareholder.id,
            )
        if (!existedUser) {
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
            )
        }

        const listIdsShareholders =
            await this.userMeetingService.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
                proposal.meetingId,
                roleMtgShareholder.id,
            )
        if (!listIdsShareholders.includes(userId)) {
            throw new HttpException(
                httpErrors.USER_NOT_HAVE_THE_RIGHT_TO_VOTE,
                HttpStatus.BAD_REQUEST,
            )
        }

        const meetingId = proposal.meetingId
        const meeting = await this.meetingService.getInternalMeetingById(
            meetingId,
        )
        const userMeeting =
            await this.userMeetingService.getUserMeetingByUserIdAndMeetingId(
                userId,
                meetingId,
            )
        const isUserJoinedMeeting =
            userMeeting.status === UserMeetingStatusEnum.PARTICIPATE
        if (!isUserJoinedMeeting) {
            throw new HttpException(
                httpErrors.USER_NOT_YET_ATTENDANCE,
                HttpStatus.BAD_REQUEST,
            )
        }

        const currentDate = new Date()
        const endVotingTime = new Date(meeting.endVotingTime)
        if (currentDate > endVotingTime) {
            throw new HttpException(
                httpErrors.VOTING_WHEN_MEETING_ENDED,
                HttpStatus.BAD_REQUEST,
            )
        }
        const shareOfUser = existedUser.quantityShare

        const existedProposal = await this.proposalRepository.getProposalById(
            proposalId,
        )

        try {
            const checkExistedVoting =
                await this.findVotingByUserIdAndProposalId(userId, proposalId)

            if (checkExistedVoting) {
                const updateCountVoteExistedProposal =
                    await this.updateVoteCount(
                        existedProposal,
                        checkExistedVoting,
                        voteProposalDto,
                        shareOfUser,
                    )
                this.logger.info(
                    `[DAPP] User ID : ${userId} ${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_SUCCESS.message} ${existedProposal.id}`,
                )
                return updateCountVoteExistedProposal
            } else {
                let createdVoting: Voting
                try {
                    createdVoting = await this.votingRepository.createVoting({
                        userId: userId,
                        proposalId: proposalId,
                        result: result,
                    })
                    switch (result) {
                        case VoteProposalResult.VOTE:
                            existedProposal.votedQuantity += shareOfUser
                            existedProposal.notVoteYetQuantity -= shareOfUser
                            break
                        case VoteProposalResult.UNVOTE:
                            existedProposal.unVotedQuantity += shareOfUser
                            existedProposal.notVoteYetQuantity -= shareOfUser
                            break
                    }
                    await createdVoting.save()
                    await existedProposal.save()
                    this.logger.info(
                        `[DAPP] User ID : ${userId} ${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_SUCCESS.message} ${existedProposal.id}`,
                    )
                    return existedProposal
                } catch (error) {
                    this.logger.error(
                        `${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_FAILED.code} [DAPP] User ID : ${userId} ${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_FAILED.message} ${existedProposal.id}`,
                    )
                    throw new HttpException(
                        httpErrors.VOTING_CREATED_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                }
            }
        } catch (error) {
            this.logger.info(
                `${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_FAILED.code} [DAPP] User ID : ${userId} ${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_FAILED.message} ${existedProposal.id}`,
            )
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async deleteVoting(proposalId: number) {
        await this.votingRepository.softDelete({ proposalId })
    }

    async updateVoteCount(
        existedProposal: Proposal,
        existedVoting: Voting,
        voteProposalDto: VoteProposalDto,
        shareOfUser: number,
    ): Promise<Proposal> {
        const { result } = voteProposalDto
        const resultOld = existedVoting.result
        if (result !== resultOld) {
            switch (resultOld) {
                case VoteProposalResult.VOTE:
                    existedProposal.votedQuantity -= shareOfUser
                    break
                case VoteProposalResult.UNVOTE:
                    existedProposal.unVotedQuantity -= shareOfUser
                    break
            }
            switch (result) {
                case VoteProposalResult.VOTE:
                    existedProposal.votedQuantity += shareOfUser
                    break
                case VoteProposalResult.UNVOTE:
                    existedProposal.unVotedQuantity += shareOfUser
                    break
            }
            if (result === VoteProposalResult.NO_IDEA) {
                existedProposal.notVoteYetQuantity += shareOfUser
                await this.votingRepository.delete(existedVoting.id)
                // await existedProposal.save()
            } else {
                existedVoting.result = result
                await existedVoting.save()
            }
            await existedProposal.save()
            return existedProposal
        } else {
            throw new HttpException(
                httpErrors.VOTING_FAILED,
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async removeUserVoting(userId: number, proposalId: number): Promise<void> {
        try {
            await this.votingRepository.delete({ userId, proposalId })
        } catch (error) {
            throw new HttpException(
                httpErrors.DELETE_FAILED_USER_VOTING,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async voteProposalOfBoardMtg(
        companyId: number,
        userId: number,
        proposalId: number,
        voteProposalDto: VoteProposalDto,
    ): Promise<Proposal> {
        const { result } = voteProposalDto

        const existedUser = await this.userService.getActiveUserById(userId)
        if (!existedUser) {
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
            )
        }

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

        const meetingId = proposal.meetingId

        const listRoleBoardMtg =
            await this.meetingRoleMtgService.getMeetingRoleMtgByMeetingId(
                meetingId,
            )

        const roleBoardMtg = listRoleBoardMtg
            .map((item) => item.roleMtg)
            .filter(
                (role) =>
                    role.roleName.toLocaleUpperCase() !==
                    RoleMtgEnum.HOST.toLocaleUpperCase(),
            )

        const participantIdLicensedVotePromise = roleBoardMtg.map(
            async (roleBoard) => {
                const participantBoardMeetings =
                    await this.userMeetingService.getUserMeetingByMeetingIdAndRole(
                        meetingId,
                        roleBoard.id,
                    )

                const participantIdOfRoles = participantBoardMeetings.map(
                    (participant) => participant.user.id,
                )
                return {
                    roleMtgId: roleBoard.id,
                    roleMtgName: roleBoard.roleName,
                    userParticipants: participantIdOfRoles,
                }
            },
        )
        const participantBoards = await Promise.all(
            participantIdLicensedVotePromise,
        )

        const participantBoardIds = participantBoards
            .map((item) => item.userParticipants)
            .flat()

        if (!participantBoardIds.includes(userId)) {
            throw new HttpException(
                httpErrors.BOARD_NOT_HAVE_THE_RIGHT_TO_VOTE,
                HttpStatus.BAD_REQUEST,
            )
        }

        const userMeeting =
            await this.userMeetingService.getUserMeetingByUserIdAndMeetingId(
                userId,
                meetingId,
            )

        const isUserJoinedBoardMeeting =
            userMeeting.status === UserMeetingStatusEnum.PARTICIPATE
        if (!isUserJoinedBoardMeeting) {
            throw new HttpException(
                httpErrors.USER_NOT_YET_ATTENDANCE,
                HttpStatus.BAD_REQUEST,
            )
        }

        const meeting = await this.meetingService.getInternalMeetingById(
            meetingId,
        )

        const currentDate = new Date()
        const endVotingTime = new Date(meeting.endVotingTime)
        if (currentDate > endVotingTime) {
            throw new HttpException(
                httpErrors.VOTING_WHEN_MEETING_ENDED,
                HttpStatus.BAD_REQUEST,
            )
        }

        const existedProposal = await this.proposalRepository.getProposalById(
            proposalId,
        )

        try {
            const checkExistedVoting =
                await this.findVotingByUserIdAndProposalId(userId, proposalId)

            if (checkExistedVoting) {
                const updateCountVoteExistedProposal =
                    await this.updateVoteCount(
                        existedProposal,
                        checkExistedVoting,
                        voteProposalDto,
                        1,
                    )
                this.logger.info(
                    `[DAPP] User ID : ${userId} ${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_SUCCESS.message} ${existedProposal.id}`,
                )
                return updateCountVoteExistedProposal
            } else {
                let createdVoting: Voting
                try {
                    createdVoting = await this.votingRepository.createVoting({
                        userId: userId,
                        proposalId: proposalId,
                        result: result,
                    })
                    switch (result) {
                        case VoteProposalResult.VOTE:
                            existedProposal.votedQuantity += 1
                            existedProposal.notVoteYetQuantity -= 1
                            break
                        case VoteProposalResult.UNVOTE:
                            existedProposal.unVotedQuantity += 1
                            existedProposal.notVoteYetQuantity -= 1
                            break
                    }
                    await createdVoting.save()
                    await existedProposal.save()
                    this.logger.info(
                        `[DAPP] User ID : ${userId} ${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_SUCCESS.message} ${existedProposal.id}`,
                    )
                    return existedProposal
                } catch (error) {
                    this.logger.error(
                        `${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_FAILED.code} [DAPP] User ID : ${userId} ${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_FAILED.message} ${existedProposal.id}`,
                    )
                    throw new HttpException(
                        httpErrors.VOTING_CREATED_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                }
            }
        } catch (error) {
            this.logger.info(
                `${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_FAILED.code} [DAPP] User ID : ${userId} ${messageLog.VOTING_PROPOSAL_SHAREHOLDER_MEETING_FAILED.message} ${existedProposal.id}`,
            )
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getAllVotingByProposalId(proposalId: number): Promise<Voting[]> {
        const voteOfProposal =
            await this.votingRepository.getInternalListVotingByProposalId(
                proposalId,
            )
        return voteOfProposal
    }
}
