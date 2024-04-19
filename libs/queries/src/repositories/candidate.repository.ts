import { Repository } from 'typeorm'
import { Candidate } from '@entities/candidate.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateCandidateDto } from '@dtos/candidate.dto'
@CustomRepository(Candidate)
export class CandidateRepository extends Repository<Candidate> {
    async createCandidate(
        createCandidate: CreateCandidateDto,
    ): Promise<Candidate> {
        const {
            title,
            candidateName,
            type,
            meetingId,
            creatorId,
            notVoteYetQuantity,
        } = createCandidate

        const createdCandidate = await this.create({
            title,
            candidateName,
            type,
            meetingId,
            creatorId,
            notVoteYetQuantity,
        })
        return await createdCandidate.save()
    }
}
