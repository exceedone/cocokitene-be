import { VotingCandidateService } from './../voting-candidate/voting-candidate.service'
import { CandidateDto, CreateCandidateDto } from '@dtos/candidate.dto'
import { Candidate } from '@entities/nominees.entity'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CandidateRepository } from '@repositories/nominees.repository'
import { httpErrors } from '@shares/exception-filter'
import { CalculateProposal } from '../proposals/proposal.interface'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { MeetingRepository } from '@repositories/meeting.repository'
import { PersonnelVotingRepository } from '@repositories/personnel-voting.repository'

@Injectable()
export class CandidateService {
    constructor(
        private readonly candidateRepository: CandidateRepository,
        private readonly boardMeetingRepository: MeetingRepository,
        // private readonly meetingService: MeetingService,
        private readonly voteCandidateService: VotingCandidateService,
        private readonly personnelVotingRepository: PersonnelVotingRepository,
    ) {}

    async createCandidate(
        createCandidateDto: CreateCandidateDto,
    ): Promise<Candidate> {
        const {
            candidateName,
            personnelVotingId,
            creatorId,
            notVoteYetQuantity,
        } = createCandidateDto

        try {
            const createdCandidate =
                await this.candidateRepository.createCandidate({
                    candidateName,
                    personnelVotingId,
                    creatorId,
                    notVoteYetQuantity,
                })

            return createdCandidate
        } catch (error) {
            throw new HttpException(
                httpErrors.CANDIDATE_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async deleteCandidate(companyId: number, candidateId: number) {
        //check existed of board meeting and candidate
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

        try {
            //deleteCandidate
            // const meetingId = candidate.personnelVoting.meeting.id
            // await this.candidateRepository.softDelete({
            //     // meetingId,
            //     id: candidateId,
            // })
            //Select voting_candidate, delete voting for candidate_id
            await this.voteCandidateService.deleteVoting(candidateId)

            await this.candidateRepository.delete({
                // meetingId,
                id: candidateId,
            })

            return `Candidate have Id: ${candidateId} deleted successfully!!!`
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async updateListCandidate(
        companyId: number,
        personnelVotingId: number,
        listCandidate: CandidateDto[],
        creatorId: number,
        notVoteYetQuantity: number,
    ) {
        const personnelVoting =
            await this.personnelVotingRepository.getPersonnelVotingById(
                personnelVotingId,
            )

        const listCurrentCandidate = personnelVoting.candidate

        //list edited
        const listEdited = listCandidate.filter((candidate) => !!candidate.id)
        const listEditedIds = listEdited.map((candidate) => candidate.id)

        //list Deleted
        const listDelete = listCurrentCandidate.filter(
            (candidate) => !listEditedIds.includes(candidate.id),
        )

        //list Added
        const listAdded = listCandidate.filter((candidate) => !candidate.id)

        try {
            await Promise.all([
                ...listEdited.map((candidate) =>
                    this.candidateRepository.updateCandidate(
                        candidate.id,
                        candidate,
                    ),
                ),

                ...listDelete.map((candidate) =>
                    this.deleteCandidate(companyId, candidate.id),
                ),

                ...listAdded.map((candidate) =>
                    this.createCandidate({
                        ...candidate,
                        personnelVotingId,
                        creatorId,
                        notVoteYetQuantity,
                    }),
                ),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }

        // const listCurrentCandidates = boardMeeting.personnelVoting
        //     .map((voting) =>
        //         voting.candidate.map((candidate) => ({
        //             ...candidate,
        //             personnelVotingId: voting.id,
        //         })),
        //     )
        //     .flatMap((candidate) => candidate)

        // //List Coming Candidate
        // const listCandidateEdited = candidates.filter(
        //     (candidate) => !!candidate.id,
        // )
        // const listCandidateEditedIds = listCandidateEdited.map(
        //     (candidate) => candidate.id,
        // )

        // //List Candidate Deleted
        // const listCandidateDeleted = listCurrentCandidates.filter(
        //     (candidate) => !listCandidateEditedIds.includes(candidate.id),
        // )

        // //List Candidate Added
        // const listCandidateAdded = candidates.filter(
        //     (candidate) => !candidate.id,
        // )

        // try {
        //     await Promise.all([
        //         ...listCandidateEdited.map(async (candidate) => {
        //             const {
        //                 votedQuantity,
        //                 unVotedQuantity,
        //                 notVoteYetQuantity,
        //             } = await this.reCalculateVoteBoardCandidate(
        //                 candidate,
        //                 boardIdActiveRemoveMeeting,
        //                 totalVoter,
        //             )
        //             ;(candidate.votedQuantity = votedQuantity),
        //                 (candidate.unVotedQuantity = unVotedQuantity),
        //                 (candidate.notVoteYetQuantity = notVoteYetQuantity),
        //                 await this.candidateRepository.updateCandidate(
        //                     candidate.id,
        //                     candidate,
        //                 )
        //         }),

        //         ...listCandidateDeleted.map((candidate) =>
        //             this.deleteCandidate(boardMeeting.companyId, candidate.id),
        //         ),

        //         ...listCandidateAdded.map((candidate) =>
        //             this.createCandidate({
        //                 candidateName: candidate.candidateName,
        //                 creatorId: userId,
        //                 notVoteYetQuantity: totalVoter,
        //                 personnelVotingId: candidate.
        //             }),
        //         ),
        //     ])
        // } catch (error) {
        //     throw new HttpException(
        //         { message: error.message },
        //         HttpStatus.BAD_REQUEST,
        //     )
        // }
    }

    async reCalculateVoteShareholderCandidate(
        candidate: CandidateDto,
        shareholderIdActiveRemoveMeeting: number[],
        totalVoter: number,
    ): Promise<CalculateProposal> {
        let votedQuantity = 0,
            unVotedQuantity = 0,
            notVoteYetQuantity = 0,
            temporaryVoteQuantity = 0,
            temporaryUnVoteQuantity = 0

        const currentCandidate =
            await this.candidateRepository.getCandidateById(candidate.id)

        await Promise.all([
            ...shareholderIdActiveRemoveMeeting.map(async (shareholderId) => {
                //Check board is voted for CandidateID
                const resultVoteCandidate =
                    await this.voteCandidateService.findVotingByUserIdAndCandidateId(
                        shareholderId,
                        currentCandidate.id,
                    )
                if (!resultVoteCandidate) {
                    return
                } else {
                    const resultVote = resultVoteCandidate.result
                    switch (resultVote) {
                        case VoteProposalResult.VOTE:
                            temporaryVoteQuantity +=
                                resultVoteCandidate.quantityShare
                            break
                        case VoteProposalResult.UNVOTE:
                            temporaryUnVoteQuantity +=
                                resultVoteCandidate.quantityShare
                            break
                    }
                    await this.voteCandidateService.removeVoting(
                        shareholderId,
                        currentCandidate.id,
                    )
                }
            }),
        ])

        votedQuantity =
            currentCandidate.votedQuantity !== null
                ? currentCandidate.votedQuantity - temporaryVoteQuantity
                : 0
        unVotedQuantity =
            currentCandidate.notVoteYetQuantity !== null
                ? currentCandidate.unVotedQuantity - temporaryUnVoteQuantity
                : 0
        notVoteYetQuantity = totalVoter - votedQuantity - unVotedQuantity

        return {
            votedQuantity,
            unVotedQuantity,
            notVoteYetQuantity,
        }
    }

    async reCalculateVoteBoardCandidate(
        candidate: CandidateDto,
        boardIdActiveRemoveMeeting: number[],
        totalVoter: number,
    ): Promise<CalculateProposal> {
        let votedQuantity = 0,
            unVotedQuantity = 0,
            notVoteYetQuantity = 0,
            temporaryVoteQuantity = 0,
            temporaryUnVoteQuantity = 0

        const currentCandidate =
            await this.candidateRepository.getCandidateById(candidate.id)

        await Promise.all([
            ...boardIdActiveRemoveMeeting.map(async (boardId) => {
                //Check board is voted for CandidateID
                const resultVoteCandidate =
                    await this.voteCandidateService.findVotingByUserIdAndCandidateId(
                        boardId,
                        currentCandidate.id,
                    )
                if (!resultVoteCandidate) {
                    return
                } else {
                    const resultVote = resultVoteCandidate.result
                    switch (resultVote) {
                        case VoteProposalResult.VOTE:
                            temporaryVoteQuantity += 1
                            break
                        case VoteProposalResult.UNVOTE:
                            temporaryUnVoteQuantity += 1
                            break
                    }
                    await this.voteCandidateService.removeVoting(
                        boardId,
                        currentCandidate.id,
                    )
                }
            }),
        ])

        votedQuantity =
            currentCandidate.votedQuantity !== null
                ? currentCandidate.votedQuantity - temporaryVoteQuantity
                : 0
        unVotedQuantity =
            currentCandidate.notVoteYetQuantity !== null
                ? currentCandidate.unVotedQuantity - temporaryUnVoteQuantity
                : 0
        notVoteYetQuantity = totalVoter - votedQuantity - unVotedQuantity

        return {
            votedQuantity,
            unVotedQuantity,
            notVoteYetQuantity,
        }
    }
}
