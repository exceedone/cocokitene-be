import { CustomRepository } from '@shares/decorators'
import { Voting } from '@entities/voting.entity'
import { Repository } from 'typeorm'
import { CreateVoteProposalDto } from '@dtos/voting.dto'

@CustomRepository(Voting)
export class VotingRepository extends Repository<Voting> {
    async createVoting(
        createVoteProposalDto: CreateVoteProposalDto,
    ): Promise<Voting> {
        const { userId, proposalId, result } = createVoteProposalDto
        const createdVoting = await this.create({
            userId: userId,
            proposalId: proposalId,
            result: result,
        })
        await createdVoting.save()
        return createdVoting
    }

    async getInternalListVotingByProposalId(
        proposalId: number,
    ): Promise<Voting[]> {
        const votings = await this.find({
            where: {
                proposalId: proposalId,
            },
            select: {
                id: true,
                result: true,
                userId: true,
                proposalId: true,
                createdAt: true,
                deletedAt: true,
            },
        })
        return votings
    }
}
