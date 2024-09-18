import { VoteCandidateDto } from '@dtos/voting-candidate.dto'
import { Candidate } from '@entities/nominees.entity'
import { VotingCandidate } from '@entities/voted-for-nominee.entity'
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common'
import { VotingCandidateRepository } from '@repositories/voting-board-members.repository'
import { MeetingRoleMtgService } from '../meeting-role-mtgs/meeting-role-mtg.service'
import { CandidateRepository } from '@repositories/nominees.repository'
import { RoleMtgEnum } from '@shares/constants'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { UserService } from '../users/user.service'
import { UserMeetingService } from '../user-meetings/user-meeting.service'
import { MeetingService } from '../meetings/meeting.service'
import { UserMeetingStatusEnum } from '@shares/constants/meeting.const'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { Logger } from 'winston'
import { VoteCandidateInPersonnel } from '@dtos/personnel-voting.dto'
import { RoleMtgService } from '../role-mtgs/role-mtg.service'
import { SocketGateway } from '../socket/socket.gateway'

@Injectable()
export class VotingCandidateService {
    constructor(
        private readonly votingCandidateRepository: VotingCandidateRepository,
        private readonly candidateRepository: CandidateRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly userMeetingService: UserMeetingService,
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
        @Inject(forwardRef(() => MeetingService))
        private readonly meetingService: MeetingService,
        private readonly roleMtgService: RoleMtgService,

        @Inject(forwardRef(() => SocketGateway))
        private readonly socketGateway: SocketGateway,

        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async findVotingByUserIdAndCandidateId(
        userId: number,
        votedForCandidateId: number,
    ): Promise<VotingCandidate> {
        try {
            const existedVotingCandidate =
                await this.votingCandidateRepository.findOne({
                    where: {
                        userId: userId,
                        votedForCandidateId: votedForCandidateId,
                    },
                })
            return existedVotingCandidate
        } catch (error) {
            console.log('Error---:', error)
        }
    }

    async voteCandidate(
        companyId: number,
        userId: number,
        candidateId: number,
        voteCandidateDto: VoteCandidateDto,
    ): Promise<Candidate> {
        const { result } = voteCandidateDto

        const existedUser = await this.userService.getActiveUserById(userId)
        if (!existedUser) {
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
            )
        }

        const candidate = await this.candidateRepository.getCandidateById(
            candidateId,
        )

        if (!candidate) {
            throw new HttpException(
                httpErrors.CANDIDATE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        // if (candidate.personnelVoting.meeting.companyId !== companyId) {
        //     throw new HttpException(
        //         httpErrors.MEETING_NOT_IN_THIS_COMPANY,
        //         HttpStatus.BAD_REQUEST,
        //     )
        // }

        const meetingId = candidate.personnelVoting.meetingId

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
                const participantBoardMeeting =
                    await this.userMeetingService.getUserMeetingByMeetingIdAndRole(
                        meetingId,
                        roleBoard.id,
                    )

                const participantIdOfRole = participantBoardMeeting.map(
                    (participant) => participant.user.id,
                )
                return {
                    roleMtgId: roleBoard.id,
                    roleMtgName: roleBoard.roleName,
                    userParticipants: participantIdOfRole,
                }
            },
        )

        const participantBoard = await Promise.all(
            participantIdLicensedVotePromise,
        )

        const participantBoardId = participantBoard
            .map((item) => item.userParticipants)
            .flat()

        if (!participantBoardId.includes(userId)) {
            throw new HttpException(
                httpErrors.BOARD_NOT_HAVE_THE_RIGHT_TO_VOTE,
                HttpStatus.BAD_REQUEST,
            )
        }

        const meeting = await this.meetingService.getInternalMeetingById(
            meetingId,
        )

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

        const currentDate = new Date()
        const endVotingTime = new Date(meeting.endVotingTime)
        if (currentDate > endVotingTime) {
            throw new HttpException(
                httpErrors.VOTING_WHEN_MEETING_ENDED,
                HttpStatus.BAD_REQUEST,
            )
        }

        try {
            const checkExistedVoting =
                await this.findVotingByUserIdAndCandidateId(userId, candidateId)

            if (checkExistedVoting) {
                const updateCountVoteExistedCandidate = await this.updateVote(
                    candidate,
                    checkExistedVoting,
                    voteCandidateDto,
                    1,
                )

                this.socketGateway.server.emit(
                    `voting-candidate-board-meeting/${meetingId}`,
                    {
                        ...updateCountVoteExistedCandidate,
                        voterId: userId,
                    },
                )

                this.logger.info(
                    `[DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_SUCCESS.message} ${candidate.id}`,
                )

                return updateCountVoteExistedCandidate
            } else {
                let createVotingCandidate: VotingCandidate
                try {
                    createVotingCandidate =
                        await this.votingCandidateRepository.createVotingCandidate(
                            {
                                userId: userId,
                                votedForCandidateId: candidateId,
                                result: result,
                                quantityShare: 1,
                            },
                        )

                    switch (result) {
                        case VoteProposalResult.VOTE:
                            candidate.votedQuantity += 1
                            candidate.notVoteYetQuantity -= 1
                            break
                        case VoteProposalResult.UNVOTE:
                            candidate.unVotedQuantity += 1
                            candidate.notVoteYetQuantity -= 1
                            break
                    }
                    await createVotingCandidate.save()
                    await candidate.save()

                    this.socketGateway.server.emit(
                        `voting-candidate-board-meeting/${meetingId}`,
                        {
                            ...candidate,
                            voterId: userId,
                        },
                    )

                    this.logger.info(
                        `[DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_SUCCESS.message} ${candidate.id}`,
                    )

                    return candidate
                } catch (error) {
                    console.log('error: ', error)
                    this.logger.error(
                        `${messageLog.VOTING_CANDIDATE_OF_MEETING_FAILED.code} [DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_FAILED.message} ${candidate.id}`,
                    )
                    throw new HttpException(
                        httpErrors.VOTING_CANDIDATE_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                }
            }
        } catch (error) {
            this.logger.error(
                `${messageLog.VOTING_CANDIDATE_OF_MEETING_FAILED.code} [DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_FAILED.message} ${candidate.id}`,
            )
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async voteCandidateInShareholderMtg(
        companyId: number,
        userId: number,
        candidateId: number,
        voteCandidateDto: VoteCandidateDto,
    ): Promise<Candidate> {
        const { result } = voteCandidateDto

        const existedUser = await this.userService.getActiveUserById(userId)
        if (!existedUser) {
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
            )
        }

        const candidate = await this.candidateRepository.getCandidateById(
            candidateId,
        )

        if (!candidate) {
            throw new HttpException(
                httpErrors.CANDIDATE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const roleMtgShareholder =
            await this.roleMtgService.getRoleMtgByNameAndCompanyId(
                RoleMtgEnum.SHAREHOLDER,
                companyId,
            )

        const meetingId: number = candidate.personnelVoting.meetingId

        const existedShareholder =
            await this.userMeetingService.getParticipantInMeeting(
                meetingId,
                userId,
                roleMtgShareholder.id,
            )

        if (
            !(existedShareholder.status === UserMeetingStatusEnum.PARTICIPATE)
        ) {
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
        const shareOfUser: number = existedShareholder.quantityShare

        try {
            const checkExistedVoting =
                await this.findVotingByUserIdAndCandidateId(userId, candidateId)

            if (checkExistedVoting) {
                const updateCountVoteExistedCandidate = await this.updateVote(
                    candidate,
                    checkExistedVoting,
                    voteCandidateDto,
                    shareOfUser,
                )
                this.logger.info(
                    `[DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_SUCCESS.message} ${candidate.id}`,
                )
                this.socketGateway.server.emit(
                    `voting-candidate-shareholder-meeting/${meetingId}`,
                    {
                        ...candidate,
                        voterId: userId,
                    },
                )

                return updateCountVoteExistedCandidate
            } else {
                let createVotingCandidate: VotingCandidate
                try {
                    createVotingCandidate =
                        await this.votingCandidateRepository.createVotingCandidate(
                            {
                                userId: userId,
                                votedForCandidateId: candidateId,
                                result: result,
                                quantityShare: shareOfUser,
                            },
                        )

                    switch (result) {
                        case VoteProposalResult.VOTE:
                            candidate.votedQuantity += shareOfUser
                            candidate.notVoteYetQuantity -= shareOfUser
                            break
                        case VoteProposalResult.UNVOTE:
                            candidate.unVotedQuantity += shareOfUser
                            candidate.notVoteYetQuantity -= shareOfUser
                            break
                    }
                    await createVotingCandidate.save()
                    await candidate.save()
                    this.logger.info(
                        `[DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_SUCCESS.message} ${candidate.id}`,
                    )

                    this.socketGateway.server.emit(
                        `voting-candidate-shareholder-meeting/${meetingId}`,
                        {
                            ...candidate,
                            voterId: userId,
                        },
                    )

                    return candidate
                } catch (error) {
                    console.log('error: ', error)
                    this.logger.error(
                        `${messageLog.VOTING_CANDIDATE_OF_MEETING_FAILED.code} [DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_FAILED.message} ${candidate.id}`,
                    )
                    throw new HttpException(
                        httpErrors.VOTING_CANDIDATE_FAILED,
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                }
            }
        } catch (error) {
            this.logger.error(
                `${messageLog.VOTING_CANDIDATE_OF_MEETING_FAILED.code} [DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_FAILED.message} ${candidate.id}`,
            )
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async deleteVoting(votedForCandidateId: number) {
        // await this.votingCandidateRepository.softDelete({ votedForCandidateId })
        await this.votingCandidateRepository.delete({ votedForCandidateId })
    }

    async updateVote(
        existedCandidate: Candidate,
        checkExistedVoting: VotingCandidate,
        voteCandidateDto: VoteCandidateDto,
        votingValue: number,
    ): Promise<Candidate> {
        const { result } = voteCandidateDto
        const resultOld = checkExistedVoting.result

        if (result !== resultOld) {
            switch (resultOld) {
                case VoteProposalResult.UNVOTE:
                    existedCandidate.unVotedQuantity -= votingValue
                    break
                case VoteProposalResult.VOTE:
                    existedCandidate.votedQuantity -= votingValue
                    break
            }

            switch (result) {
                case VoteProposalResult.UNVOTE:
                    existedCandidate.unVotedQuantity += votingValue
                    break
                case VoteProposalResult.VOTE:
                    existedCandidate.votedQuantity += votingValue
                    break
            }
            if (result === VoteProposalResult.NO_IDEA) {
                existedCandidate.notVoteYetQuantity += votingValue
                await this.votingCandidateRepository.delete(
                    checkExistedVoting.id,
                )
            } else {
                checkExistedVoting.result = result
                await checkExistedVoting.save()
            }
            await existedCandidate.save()
            return existedCandidate
        } else {
            throw new HttpException(
                httpErrors.VOTING_FAILED,
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async removeVoting(
        userId: number,
        votedForCandidateId: number,
    ): Promise<void> {
        try {
            await this.votingCandidateRepository.delete({
                userId,
                votedForCandidateId,
            })
        } catch (error) {
            throw new HttpException(
                httpErrors.DELETE_FAILED_USER_VOTING,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getAllVotingByCandidateId(
        candidateId: number,
    ): Promise<VotingCandidate[]> {
        const voteOfCandidate =
            await this.votingCandidateRepository.getListVotedByCandidateId(
                candidateId,
            )

        return voteOfCandidate
    }

    async updateVoteCandidate(
        candidate: Candidate,
        checkExistedVoting: VotingCandidate,
        voteCandidateDto: VoteCandidateInPersonnel,
    ): Promise<Candidate> {
        try {
            const { result, quantityShare } = voteCandidateDto
            const resultOld = checkExistedVoting.result

            if (
                result !== resultOld ||
                quantityShare !== checkExistedVoting.quantityShare
            ) {
                switch (resultOld) {
                    case VoteProposalResult.UNVOTE:
                        candidate.unVotedQuantity -=
                            checkExistedVoting.quantityShare
                        candidate.notVoteYetQuantity +=
                            checkExistedVoting.quantityShare
                        break
                    case VoteProposalResult.VOTE:
                        candidate.votedQuantity -=
                            checkExistedVoting.quantityShare
                        candidate.notVoteYetQuantity +=
                            checkExistedVoting.quantityShare
                        break
                }

                switch (result) {
                    case VoteProposalResult.UNVOTE:
                        candidate.unVotedQuantity += quantityShare
                        candidate.notVoteYetQuantity -= quantityShare
                        break
                    case VoteProposalResult.VOTE:
                        candidate.votedQuantity += quantityShare
                        candidate.notVoteYetQuantity -= quantityShare
                        break
                }
                if (
                    result === VoteProposalResult.NO_IDEA ||
                    quantityShare == 0 ||
                    quantityShare == null
                ) {
                    candidate.notVoteYetQuantity +=
                        checkExistedVoting.quantityShare
                    await this.votingCandidateRepository.delete(
                        checkExistedVoting.id,
                    )
                } else {
                    checkExistedVoting.result = result
                    checkExistedVoting.quantityShare = quantityShare
                    await checkExistedVoting.save()
                }
                await candidate.save()
                return candidate
            }

            return candidate
        } catch (error) {
            console.log('error UpdateVoteCandidate: ', error)
        }
    }
}
