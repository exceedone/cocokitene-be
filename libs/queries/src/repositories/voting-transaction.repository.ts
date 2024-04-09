import { Repository } from 'typeorm'
import { VotingTransaction } from '@entities/voting-transaction.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateVotingTransactionDto } from '@dtos/voting.dto'

@CustomRepository(VotingTransaction)
export class VotingTransactionRepository extends Repository<VotingTransaction> {
    async getVotingTransactionByProposalId(
        proposalId: number,
    ): Promise<VotingTransaction[]> {
        const votingTransactions = await this.find({
            where: {
                proposalId: proposalId,
            },
        })
        return votingTransactions
    }

    async createVotingTransaction(
        createVotingTransactionDto: CreateVotingTransactionDto,
    ): Promise<VotingTransaction> {
        const { votingId, result, userId, proposalId } =
            createVotingTransactionDto
        const createVotingTransaction = await this.create({
            votingId,
            result,
            userId,
            proposalId,
        })
        return await createVotingTransaction.save()
    }
}
