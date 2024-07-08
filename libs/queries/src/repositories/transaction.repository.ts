import { Repository } from 'typeorm'
import { Transaction } from '@entities/transaction.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateTransactionDto } from '@dtos/transaction.dto'
import { TRANSACTION_STATUS } from '@shares/constants'

@CustomRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {
    async createTransaction(
        createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        const {
            chainId,
            contractAddress,
            meetingId,
            keyQuery,
            detailMeetingHash,
            basicInformationMeetingHash,
            fileMeetingHash,
            proposalMeetingHash,
            votedProposalHash,
            candidateHash,
            votedCandidateHash,
            participantHash,
        } = createTransactionDto

        const createTransaction = await this.create({
            chainId,
            contractAddress,
            meetingId,
            keyQuery,
            detailMeetingHash,
            basicInformationMeetingHash,
            fileMeetingHash,
            proposalMeetingHash,
            votedProposalHash,
            candidateHash,
            votedCandidateHash,
            participantHash,
        })
        return await createTransaction.save()
    }

    async getMeetingIdsWithTransactions(): Promise<number[]> {
        const transactions = await this.createQueryBuilder('transactions')
            .select(['transactions.meetingId'])
            .getMany()
        const meetingIds = transactions.map(
            (transaction) => transaction.meetingId,
        )
        return meetingIds
    }

    async findTransactionByStatus(
        transactionStatus: TRANSACTION_STATUS,
    ): Promise<Transaction[]> {
        const transactions = await this.find({
            where: {
                status: transactionStatus,
            },
        })
        return transactions
    }

    async updateTransaction(
        id: number,
        updateOptions: Partial<Transaction>,
    ): Promise<void> {
        await this.createQueryBuilder('transactions')
            .update(Transaction)
            .set(updateOptions)
            .where('transactions.id = :id', { id })
            .execute()
    }

    async updateTransactionByKeyQuery(
        keyMeeting: string,
        updateOptions: Partial<Transaction>,
    ) {
        await this.createQueryBuilder('transactions')
            .update(Transaction)
            .set(updateOptions)
            .where('transactions.key_query = :keyQuery', {
                keyQuery: keyMeeting,
            })
            .execute()
    }

    async getTransactionByMeetingId(meetingId: number): Promise<Transaction> {
        const transaction = await this.createQueryBuilder('transactions')
            .where('transactions.meeting_id = :meeting_id', {
                meeting_id: meetingId,
            })
            .getOne()

        return transaction
    }
}
