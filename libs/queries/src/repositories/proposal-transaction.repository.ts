import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { ProposalTransaction } from '@entities/proposal-transaction.entity'
import { ResultVoteProposalDto } from '@dtos/proposal.dto'

@CustomRepository(ProposalTransaction)
export class ProposalTransactionRepository extends Repository<ProposalTransaction> {
    async createProposalTransaction(
        resultVoteProposalDto: ResultVoteProposalDto,
    ): Promise<ProposalTransaction> {
        const {
            proposalId,
            notVoteYetQuantity,
            votedQuantity,
            unVotedQuantity,
            meetingId,
            titleProposal,
        } = resultVoteProposalDto

        const createProposalTransaction = await this.create({
            proposalId,
            titleProposal,
            meetingId,
            votedQuantity,
            unVotedQuantity,
            notVoteYetQuantity,
        })
        return await createProposalTransaction.save()
    }

    async getProposalTransactionsByMeetingId(
        meetingId: number,
    ): Promise<ProposalTransaction[]> {
        const listProposalTransactions = await this.find({
            where: {
                meetingId: meetingId,
            },
        })
        return listProposalTransactions
    }
}
