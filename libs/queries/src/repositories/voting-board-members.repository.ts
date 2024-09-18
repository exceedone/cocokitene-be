import { Repository } from 'typeorm'
import { VotingCandidate } from '@entities/voted-for-nominee.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateVoteCandidateDto } from '@dtos/voting-candidate.dto'

@CustomRepository(VotingCandidate)
export class VotingCandidateRepository extends Repository<VotingCandidate> {
    async createVotingCandidate(
        createVoteCandidateDto: CreateVoteCandidateDto,
    ): Promise<VotingCandidate> {
        const { userId, votedForCandidateId, result, quantityShare } =
            createVoteCandidateDto

        const createVotingCandidate = await this.create({
            userId: userId,
            votedForCandidateId: votedForCandidateId,
            result: result,
            quantityShare: quantityShare,
        })
        await createVotingCandidate.save()
        return createVotingCandidate
    }

    async getListVotedByCandidateId(
        candidateId: number,
    ): Promise<VotingCandidate[]> {
        const votingCandidate = await this.find({
            where: {
                votedForCandidateId: candidateId,
            },
            select: {
                id: true,
                userId: true,
                votedForCandidateId: true,
                result: true,
                quantityShare: true,
                createdAt: true,
                deletedAt: true,
            },
        })
        return votingCandidate
    }
}
