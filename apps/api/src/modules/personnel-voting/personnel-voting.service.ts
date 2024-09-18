import {
    CreatePersonnelVotingDto,
    PersonnelVotingDto,
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
import { httpErrors } from '@shares/exception-filter'
import { MeetingService } from '../meetings/meeting.service'
import { Logger } from 'winston'
@Injectable()
export class PersonnelVotingService {
    constructor(
        private readonly personnelVotingRepository: PersonnelVotingRepository,
        private readonly meetingRepository: MeetingRepository,
        private readonly candidateService: CandidateService,
        private readonly candidateRepository: CandidateRepository,

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

    async getAllPersonnelVotingByMtgId(meetingId: number) {
        const personnelVoting =
            await this.personnelVotingRepository.getAllPersonnelVotingByMtgId(
                meetingId,
            )

        return personnelVoting
    }
}
