import { VotingCandidateService } from './../voting-candidate/voting-candidate.service'
import { CandidateDto, CreateCandidateDto } from '@dtos/candidate.dto'
import { Candidate } from '@entities/candidate.entity'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CandidateRepository } from '@repositories/candidate.repository'
import { httpErrors } from '@shares/exception-filter'
import { MeetingService } from '../meetings/meeting.service'
import { CalculateProposal } from '../proposals/proposal.interface'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { MeetingRepository } from '@repositories/meeting.repository'

@Injectable()
export class CandidateService {
    constructor(
        private readonly candidateRepository: CandidateRepository,
        private readonly boardMeetingRepository: MeetingRepository,
        private readonly meetingService: MeetingService,
        private readonly voteCandidateService: VotingCandidateService,
    ) {}

    async createCandidate(
        createCandidateDto: CreateCandidateDto,
    ): Promise<Candidate> {
        const {
            title,
            candidateName,
            type,
            meetingId,
            creatorId,
            notVoteYetQuantity,
        } = createCandidateDto

        try {
            const createdCandidate =
                await this.candidateRepository.createCandidate({
                    title,
                    candidateName,
                    type,
                    meetingId,
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

        if (candidate.meeting.companyId !== companyId) {
            throw new HttpException(
                httpErrors.MEETING_NOT_IN_THIS_COMPANY,
                HttpStatus.BAD_REQUEST,
            )
        }

        try {
            //deleteCandidate
            const meetingId = candidate.meeting.id
            await this.candidateRepository.softDelete({
                meetingId,
                id: candidateId,
            })
            //Select voting_candidate, delete voting for candidate_id
            await this.voteCandidateService.deleteVoting(candidateId)

            return `Candidate have Id: ${candidateId} deleted successfully!!!`
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async updateListCandidateBoardMtg(
        companyId,
        meetingId: number,
        userId: number,
        candidates: CandidateDto[],
        boardIdActiveRemoveMeeting: number[],
        totalVoter: number,
    ) {
        const boardMeeting =
            await this.boardMeetingRepository.getBoardMeetingByIdAndCompanyId(
                meetingId,
                companyId,
            )

        const listCurrentCandidates = boardMeeting.candidates

        //List Coming Candidate
        const listCandidateEdited = candidates.filter(
            (candidate) => !!candidate.id,
        )
        const listCandidateEditedIds = listCandidateEdited.map(
            (candidate) => candidate.id,
        )

        //List Candidate Deleted
        const listCandidateDeleted = listCurrentCandidates.filter(
            (candidate) => !listCandidateEditedIds.includes(candidate.id),
        )

        //List Candidate Added
        const listCandidateAdded = candidates.filter(
            (candidate) => !candidate.id,
        )

        try {
            await Promise.all([
                ...listCandidateEdited.map(async (candidate) => {
                    const {
                        votedQuantity,
                        unVotedQuantity,
                        notVoteYetQuantity,
                    } = await this.reCalculateVoteBoardCandidate(
                        candidate,
                        boardIdActiveRemoveMeeting,
                        totalVoter,
                    )
                    ;(candidate.votedQuantity = votedQuantity),
                        (candidate.unVotedQuantity = unVotedQuantity),
                        (candidate.notVoteYetQuantity = notVoteYetQuantity),
                        await this.candidateRepository.updateCandidate(
                            candidate.id,
                            candidate,
                        )
                }),

                ...listCandidateDeleted.map((candidate) =>
                    this.deleteCandidate(boardMeeting.companyId, candidate.id),
                ),

                ...listCandidateAdded.map((candidate) =>
                    this.createCandidate({
                        title: candidate.title,
                        candidateName: candidate.candidateName,
                        type: candidate.type,
                        meetingId,
                        creatorId: userId,
                        notVoteYetQuantity: totalVoter,
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
