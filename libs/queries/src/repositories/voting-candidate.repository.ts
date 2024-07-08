import { Repository } from 'typeorm'
import { VotingCandidate } from '@entities/voting-candidate.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateVoteCandidateDto } from '@dtos/voting-candidate.dto'

@CustomRepository(VotingCandidate)
export class VotingCandidateRepository extends Repository<VotingCandidate> {
    async createVotingCandidate(
        createVoteCandidateDto: CreateVoteCandidateDto,
    ): Promise<VotingCandidate> {
        const { userId, votedForCandidateId, result } = createVoteCandidateDto

        const createVotingCandidate = await this.create({
            userId: userId,
            votedForCandidateId: votedForCandidateId,
            result: result,
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
        })
        return votingCandidate
    }
}
