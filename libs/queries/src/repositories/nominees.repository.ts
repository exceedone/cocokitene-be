import { Repository } from 'typeorm'
import { Candidate } from '@entities/nominees.entity'
import { CustomRepository } from '@shares/decorators'
import { CandidateUpdateDto, CreateCandidateDto } from '@dtos/candidate.dto'

@CustomRepository(Candidate)
export class CandidateRepository extends Repository<Candidate> {
    async createCandidate(
        createCandidate: CreateCandidateDto,
    ): Promise<Candidate> {
        const {
            candidateName,
            personnelVotingId,
            creatorId,
            notVoteYetQuantity,
        } = createCandidate

        const createdCandidate = await this.create({
            candidateName,
            personnelVotingId,
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
            relations: ['personnelVoting'],
        })
        return candidate
    }

    async updateCandidate(
        candidateId: number,
        candidateUpdateDto: CandidateUpdateDto,
    ): Promise<Candidate> {
        const {
            candidateName,
            votedQuantity,
            unVotedQuantity,
            notVoteYetQuantity,
        } = candidateUpdateDto

        await this.createQueryBuilder('nominees')
            .update(Candidate)
            .set({
                candidateName: candidateName,
                unVotedQuantity: unVotedQuantity,
                votedQuantity: votedQuantity,
                notVoteYetQuantity: notVoteYetQuantity,
            })
            .where('nominees.id = :nomineeId', { nomineeId: candidateId })
            .execute()
        const candidate = await this.getCandidateById(candidateId)
        return candidate
    }

    async getAllCandidateByMeetingId(meetingId: number): Promise<Candidate[]> {
        console.log(meetingId)
        const candidates = await this.find({
            // where: {
            //     meetingId: meetingId,
            // },
            select: {
                id: true,
                candidateName: true,
                votedQuantity: true,
                unVotedQuantity: true,
                notVoteYetQuantity: true,
                creatorId: true,
                deletedAt: true,
            },
        })
        return candidates
    }
}
