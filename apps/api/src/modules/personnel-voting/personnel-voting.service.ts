import {
    CreatePersonnelVotingDto,
    PersonnelVotingDto,
    VotePersonnelDto,
} from '@dtos/personnel-voting.dto'
import { PersonnelVoting } from '@entities/personnel-voting.entity'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { PersonnelVotingRepository } from '@repositories/personnel-voting.repository'
import { CandidateService } from '../candidate/candidate.service'
import { MeetingRepository } from '@repositories/meeting.repository'
import { CandidateRepository } from '@repositories/nominees.repository'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { RoleMtgEnum } from '@shares/constants'
import { RoleMtgService } from '../role-mtgs/role-mtg.service'
import { UserMeetingService } from '../user-meetings/user-meeting.service'
import { UserMeetingStatusEnum } from '@shares/constants/meeting.const'
import { MeetingService } from '../meetings/meeting.service'
import { VotingCandidateService } from '../voting-candidate/voting-candidate.service'
import { VotingCandidate } from '@entities/voted-for-nominee.entity'
import { VotingCandidateRepository } from '@repositories/voting-board-members.repository'
import { Logger } from 'winston'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import {
    CandidateItemDetailMeeting,
    personnelVotingDetailMeeting,
} from '../meetings/meeting.interface'

@Injectable()
export class PersonnelVotingService {
    constructor(
        private readonly personnelVotingRepository: PersonnelVotingRepository,
        private readonly meetingRepository: MeetingRepository,
        private readonly candidateService: CandidateService,
        private readonly candidateRepository: CandidateRepository,
        private readonly roleMtgService: RoleMtgService,
        private readonly userMeetingService: UserMeetingService,
        private readonly votingCandidateService: VotingCandidateService,
        private readonly votingCandidateRepository: VotingCandidateRepository,

        @Inject(forwardRef(() => MeetingService))
        private readonly meetingService: MeetingService,

        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async createPersonnelVoting(
        createPersonnelDto: CreatePersonnelVotingDto,
        notVoteYetQuantity?: number,
    ): Promise<PersonnelVoting> {
        const { title, type, meetingId, creatorId, candidate } =
            createPersonnelDto

        const createdPersonnelVoting =
            await this.personnelVotingRepository.createPersonnelVoting({
                title,
                type,
                meetingId,
                creatorId,
            })

        if (candidate && candidate.length > 0) {
            await Promise.all([
                ...candidate.map((candidate) =>
                    this.candidateService.createCandidate({
                        candidateName: candidate.candidateName,
                        personnelVotingId: createdPersonnelVoting.id,
                        creatorId: creatorId,
                        notVoteYetQuantity: notVoteYetQuantity,
                    }),
                ),
            ])
        }

        return createdPersonnelVoting
    }

    async updateListPersonnelVotingBoardMtg(
        companyId: number,
        meetingId: number,
        userId: number,
        personnelVoting: PersonnelVotingDto[],
        boardIdActiveRemoveMeeting: number[],
        totalVoter: number,
    ) {
        const boardMeeting =
            await this.meetingRepository.getBoardMeetingByIdAndCompanyId(
                meetingId,
                companyId,
            )

        // List current PersonnelVoting
        const listCurrentPersonnelVoting = boardMeeting.personnelVoting
        const listCurrentPersonnelVotingId = listCurrentPersonnelVoting.map(
            (item) => item.id,
        )

        // List Coming PersonnelVoting
        const listPersonnelVotingEdited = personnelVoting.filter(
            (voting) => !!voting.id,
        )

        const listPersonnelVotingEditedIds = personnelVoting.map(
            (voting) => voting.id,
        )

        //List PersonnelVoting Delete
        const listPersonnelVotingDeleted = listCurrentPersonnelVoting.filter(
            (voting) => !listPersonnelVotingEditedIds.includes(voting.id),
        )

        //List PersonnelVoting Add
        const listPersonnelVotingAdded = personnelVoting.filter(
            (voting) => !voting.id,
        )

        //List PersonnelVoting Edit
        const listPersonnelVotingEdit = listPersonnelVotingEdited.filter(
            (voting) => listCurrentPersonnelVotingId.includes(voting.id),
        )

        try {
            await Promise.all([
                ...listPersonnelVotingEdit.map(async (personnelVote) => {
                    await this.personnelVotingRepository.updatePersonnelVoting(
                        personnelVote.id,
                        personnelVote,
                    )
                    personnelVote.candidate.forEach(async (candidate) => {
                        const {
                            votedQuantity,
                            unVotedQuantity,
                            notVoteYetQuantity,
                        } =
                            await this.candidateService.reCalculateVoteBoardCandidate(
                                candidate,
                                boardIdActiveRemoveMeeting,
                                totalVoter,
                            )
                        candidate.votedQuantity = votedQuantity
                        candidate.unVotedQuantity = unVotedQuantity
                        candidate.notVoteYetQuantity = notVoteYetQuantity
                        await this.candidateRepository.updateCandidate(
                            candidate.id,
                            candidate,
                        )
                    })
                }),

                ...listPersonnelVotingDeleted.map((personnelVote) => {
                    this.deletePersonnelVoting(companyId, personnelVote.id)
                }),

                ...listPersonnelVotingAdded.map((personnelVote) => {
                    this.createPersonnelVoting(
                        {
                            ...personnelVote,
                            meetingId: meetingId,
                            creatorId: userId,
                        },
                        totalVoter,
                    )
                }),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async updateListPersonnelVoting(
        companyId: number,
        meetingId: number,
        userId: number,
        personnelVoting: PersonnelVotingDto[],
        shareholderRemoveMeeting: number[],
        totalShares: number,
    ) {
        const meeting = await this.meetingRepository.getMeetingByIdAndCompanyId(
            meetingId,
            companyId,
        )

        //List current PersonnelVoting in ShareholderMTG
        const listCurrentPersonnelVoting = meeting.personnelVoting
        const listCurrentPersonnelVotingId = listCurrentPersonnelVoting.map(
            (item) => item.id,
        )

        // List Coming PersonnelVoting
        const listPersonnelVotingEdited = personnelVoting.filter(
            (voting) => !!voting.id,
        )

        const listPersonnelVotingEditedIds = personnelVoting.map(
            (voting) => voting.id,
        )

        //List PersonnelVoting Delete
        const listPersonnelVotingDeleted = listCurrentPersonnelVoting.filter(
            (voting) => !listPersonnelVotingEditedIds.includes(voting.id),
        )

        //List PersonnelVoting Add
        const listPersonnelVotingAdded = personnelVoting.filter(
            (voting) => !voting.id,
        )

        //List PersonnelVoting Edit
        const listPersonnelVotingEdit = listPersonnelVotingEdited.filter(
            (voting) => listCurrentPersonnelVotingId.includes(voting.id),
        )

        try {
            await Promise.all([
                ...listPersonnelVotingEdit.map(async (personnelVote) => {
                    await this.personnelVotingRepository.updatePersonnelVoting(
                        personnelVote.id,
                        personnelVote,
                    )
                    personnelVote.candidate.forEach(async (candidate) => {
                        const {
                            votedQuantity,
                            unVotedQuantity,
                            notVoteYetQuantity,
                        } =
                            await this.candidateService.reCalculateVoteShareholderCandidate(
                                candidate,
                                shareholderRemoveMeeting,
                                totalShares,
                            )
                        candidate.votedQuantity = votedQuantity
                        candidate.unVotedQuantity = unVotedQuantity
                        candidate.notVoteYetQuantity = notVoteYetQuantity
                        // console.log('candidate: ', candidate)
                        await this.candidateRepository.updateCandidate(
                            candidate.id,
                            candidate,
                        )
                    })
                }),

                //UpdateListCandidate of PersonnelVoting
                ...listPersonnelVotingEdit.map((personnelVoting) =>
                    this.candidateService.updateListCandidate(
                        companyId,
                        personnelVoting.id,
                        personnelVoting.candidate,
                        userId,
                        totalShares,
                    ),
                ),

                ...listPersonnelVotingDeleted.map((personnelVote) => {
                    this.deletePersonnelVoting(companyId, personnelVote.id)
                }),

                ...listPersonnelVotingAdded.map((personnelVote) => {
                    this.createPersonnelVoting(
                        {
                            ...personnelVote,
                            meetingId: meetingId,
                            creatorId: userId,
                        },
                        totalShares,
                    )
                }),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async deletePersonnelVoting(companyId: number, personnelVotingId: number) {
        // check existed of personnelVoting
        const personnelVoting =
            await this.personnelVotingRepository.getPersonnelVotingById(
                personnelVotingId,
            )

        if (!personnelVoting) {
            throw new HttpException(
                httpErrors.CANDIDATE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        try {
            // await this.personnelVotingRepository.softDelete({
            //     id: personnelVotingId,
            // })
            // await this.personnelVotingRepository.softDelete({
            //     id: personnelVotingId,
            // })
            // Delete Candidate , Voted for Candidate
            await Promise.all([
                personnelVoting.candidate.forEach((candidate) => {
                    this.candidateService.deleteCandidate(
                        companyId,
                        candidate.id,
                    )
                }),
            ])
            await this.personnelVotingRepository.softDelete({
                id: personnelVotingId,
            })
        } catch (error) {
            console.log('error: ', error)
        }
    }

    async voteCandidateInPersonnel(
        companyId: number,
        userId: number,
        personnelId: number,
        votePersonnelDto: VotePersonnelDto,
    ): Promise<personnelVotingDetailMeeting> {
        const personnelVoting =
            await this.personnelVotingRepository.getPersonnelVotingById(
                personnelId,
            )

        if (!personnelVoting) {
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

        const existedUser =
            await this.userMeetingService.getParticipantInMeeting(
                personnelVoting.meetingId,
                userId,
                roleMtgShareholder.id,
            )
        if (!existedUser) {
            throw new HttpException(
                httpErrors.USER_NOT_HAVE_THE_RIGHT_TO_VOTE,
                HttpStatus.BAD_REQUEST,
            )
        }

        if (existedUser.status !== UserMeetingStatusEnum.PARTICIPATE) {
            throw new HttpException(
                httpErrors.USER_NOT_YET_ATTENDANCE,
                HttpStatus.BAD_REQUEST,
            )
        }

        const totalQuantityShareVote = votePersonnelDto.candidate.reduce(
            (accumulator, currentValue) => {
                accumulator += currentValue.quantityShare
                return accumulator
            },
            0,
        )

        if (totalQuantityShareVote > existedUser.quantityShare) {
            throw new HttpException(
                httpErrors.QUANTITY_SHARE_WRONG,
                HttpStatus.BAD_REQUEST,
            )
        }

        const meeting = await this.meetingService.getInternalMeetingById(
            personnelVoting.meetingId,
        )

        const currentDate = new Date()
        const endVotingTime = new Date(meeting.endVotingTime)
        if (currentDate > endVotingTime) {
            throw new HttpException(
                httpErrors.VOTING_WHEN_MEETING_ENDED,
                HttpStatus.BAD_REQUEST,
            )
        }

        try {
            await Promise.all([
                ...votePersonnelDto.candidate.map(async (candidate) => {
                    const existedCandidate =
                        await this.candidateRepository.getCandidateById(
                            candidate.id,
                        )

                    const checkExistedVoting =
                        await this.votingCandidateService.findVotingByUserIdAndCandidateId(
                            userId,
                            candidate.id,
                        )

                    if (checkExistedVoting) {
                        const updateVoteCandidate =
                            await this.votingCandidateService.updateVoteCandidate(
                                existedCandidate,
                                checkExistedVoting,
                                candidate,
                            )
                        this.logger.info(
                            `[DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_SUCCESS.message} ${updateVoteCandidate?.id}`,
                        )
                        // return updateVoteCandidate
                    } else {
                        let createVotingCandidate: VotingCandidate

                        if (candidate.quantityShare) {
                            createVotingCandidate =
                                await this.votingCandidateRepository.createVotingCandidate(
                                    {
                                        userId: userId,
                                        votedForCandidateId: candidate.id,
                                        result: candidate.result,
                                        quantityShare: candidate.quantityShare,
                                    },
                                )

                            switch (candidate.result) {
                                case VoteProposalResult.VOTE:
                                    existedCandidate.votedQuantity +=
                                        candidate.quantityShare
                                    existedCandidate.notVoteYetQuantity -=
                                        candidate.quantityShare
                                    break
                                case VoteProposalResult.UNVOTE:
                                    existedCandidate.unVotedQuantity +=
                                        candidate.quantityShare
                                    existedCandidate.notVoteYetQuantity -=
                                        candidate.quantityShare
                                    break
                            }
                            await createVotingCandidate.save()
                            await existedCandidate.save()
                            this.logger.info(
                                `[DAPP] User ID : ${userId} ${messageLog.VOTING_CANDIDATE_OF_MEETING_SUCCESS.message} ${candidate?.id}`,
                            )

                            // return createVotingCandidate
                        }
                    }
                }),
            ])
        } catch (error) {
            console.log('error: ', error)
            throw new HttpException(
                httpErrors.VOTING_CANDIDATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        const personnelVotingEdited =
            await this.personnelVotingRepository.getPersonnelVotingById(
                personnelId,
            )
        const listCandidate: CandidateItemDetailMeeting[] = []
        for (const candidate of personnelVotingEdited.candidate) {
            const existedVotingCandidate =
                await this.votingCandidateService.findVotingByUserIdAndCandidateId(
                    userId,
                    candidate.id,
                )
            if (
                !existedVotingCandidate ||
                existedVotingCandidate.result === VoteProposalResult.NO_IDEA
            ) {
                listCandidate.push({
                    ...candidate,
                    voteResult: VoteProposalResult.NO_IDEA,
                    votedQuantityShare: null,
                } as CandidateItemDetailMeeting)
            } else if (
                existedVotingCandidate.result === VoteProposalResult.VOTE
            ) {
                listCandidate.push({
                    ...candidate,
                    voteResult: VoteProposalResult.VOTE,
                    votedQuantityShare: existedVotingCandidate.quantityShare,
                } as CandidateItemDetailMeeting)
            } else {
                listCandidate.push({
                    ...candidate,
                    voteResult: VoteProposalResult.UNVOTE,
                    votedQuantityShare: existedVotingCandidate.quantityShare,
                } as CandidateItemDetailMeeting)
            }
        }

        // console.log('personnelVotingEdited: ', {
        //     ...personnelVotingEdited,
        //     candidate: listCandidate,
        // })
        return {
            ...personnelVotingEdited,
            candidate: listCandidate,
        }
    }
}
