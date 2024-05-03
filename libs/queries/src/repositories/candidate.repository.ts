import { Repository } from 'typeorm'
import { Candidate } from '@entities/candidate.entity'
import { CustomRepository } from '@shares/decorators'
import { CandidateUpdateDto, CreateCandidateDto } from '@dtos/candidate.dto'
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

    async getCandidateById(candidateId: number): Promise<Candidate> {
        const candidate = await this.findOne({
            where: {
                id: candidateId,
            },
            relations: ['meeting'],
        })
        return candidate
    }

    async updateCandidate(
        candidateId: number,
        candidateUpdateDto: CandidateUpdateDto,
    ): Promise<Candidate> {
        const {
            title,
            candidateName,
            type,
            meetingId,
            votedQuantity,
            unVotedQuantity,
            notVoteYetQuantity,
        } = candidateUpdateDto

        await this.createQueryBuilder('candidate')
            .update(Candidate)
            .set({
                title: title,
                candidateName: candidateName,
                type: type,
                meetingId: meetingId,
                unVotedQuantity: unVotedQuantity,
                votedQuantity: votedQuantity,
                notVoteYetQuantity: notVoteYetQuantity,
            })
            .where('candidate.id = :candidateId', { candidateId })
            .execute()
        const candidate = await this.getCandidateById(candidateId)
        return candidate
    }
}
