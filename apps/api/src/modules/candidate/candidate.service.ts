import { CreateCandidateDto } from '@dtos/candidate.dto'
import { Candidate } from '@entities/candidate.entity'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CandidateRepository } from '@repositories/candidate.repository'
import { httpErrors } from '@shares/exception-filter'

@Injectable()
export class CandidateService {
    constructor(private readonly candidateRepository: CandidateRepository) {}

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
}
