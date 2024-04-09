import { Repository } from 'typeorm'
import { Transaction } from '@entities/transaction.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateTransactionDto } from '@dtos/transaction.dto'
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '@shares/constants'
import { TransactionMapper } from '@shares/mappers'
import { TransactionResponseData } from '@dtos/mapper.dto'

@CustomRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {
    async createTransaction(
        createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        const {
            chainId,
            companyId,
            titleMeeting,
            joinedMeetingShares,
            shareholdersJoined,
            shareholdersTotal,
            totalMeetingShares,
            meetingId,
            meetingLink,
            startTimeMeeting,
            endTimeMeeting,
            contractAddress,
            type,
        } = createTransactionDto

        const createTransaction = await this.create({
            chainId,
            companyId,
            titleMeeting,
            joinedMeetingShares,
            shareholdersJoined,
            shareholdersTotal,
            totalMeetingShares,
            meetingId,
            meetingLink,
            startTimeMeeting,
            endTimeMeeting,
            type,
            contractAddress,
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

    async getTransactionsCreateMeetingSuccessful(): Promise<
        TransactionResponseData[]
    > {
        const transactions = await this.createQueryBuilder('transactions')
            .select([
                'transactions.meetingId',
                'transactions.companyId',
                'transactions.contractAddress',
                'transactions.meetingLink',
                'transactions.titleMeeting',
                'transactions.startTimeMeeting',
                'transactions.endTimeMeeting',
                'transactions.shareholdersTotal',
                'transactions.shareholdersJoined',
                'transactions.joinedMeetingShares',
                'transactions.totalMeetingShares',
                'transactions.status',
                'transactions.type',
            ])
            .where('transactions.type = :type', {
                type: TRANSACTION_TYPE.CREATE_MEETING,
            })
            .andWhere('transactions.status = :status', {
                status: TRANSACTION_STATUS.SUCCESS,
            })
            .andWhere(
                'NOT EXISTS (SELECT 1 FROM transactions AS t  WHERE t.meeting_id = transactions.meetingId AND t.type IN (:...types))',
                {
                    types: [
                        TRANSACTION_TYPE.UPDATE_PROPOSAL_MEETING,
                        TRANSACTION_TYPE.UPDATE_USER_PARTICIPATE_MEETING,
                        TRANSACTION_TYPE.UPDATE_FILE_PROPOSAL_MEETING,
                    ],
                },
            )
            .getRawMany()

        const mappedTransactions = transactions.map((transaction) => {
            return TransactionMapper({
                transactions_title_meeting:
                    transaction.transactions_title_meeting,
                transactions_chain_id: transaction.transactions_chain_id,
                transactions_contract_address:
                    transaction.transactions_contract_address,
                transactions_meeting_link:
                    transaction.transactions_meeting_link,
                transactions_meeting_id: transaction.transactions_meeting_id,
                transactions_start_time_meeting:
                    transaction.transactions_start_time_meeting,
                transactions_end_time_meeting:
                    transaction.transactions_end_time_meeting,
                transactions_company_id: transaction.transactions_company_id,
                transactions_shareholder_total:
                    transaction.transactions_shareholder_total,
                transactions_shareholders_joined:
                    transaction.transactions_shareholders_joined,
                transactions_joined_meeting_shares:
                    transaction.transactions_joined_meeting_shares,
                transactions_total_meeting_shares:
                    transaction.transactions_total_meeting_shares,
                transactions_status: transaction.transactions_status,
                transactions_type: transaction.transactions_type,
            })
        })
        return mappedTransactions
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

    async updateTransactionByMeetingIdAndType(
        meetingId: number,
        type: TRANSACTION_TYPE,
        updateOptions: Partial<Transaction>,
    ) {
        await this.createQueryBuilder('transactions')
            .update(Transaction)
            .set(updateOptions)
            .where('transactions.meeting_id = :meetingId', { meetingId })
            .andWhere('transactions.type = :type', { type })
            .execute()
    }
    async transactionsUpdateProposalMeetingSuccessful(): Promise<
        TransactionResponseData[]
    > {
        const transactions = await this.createQueryBuilder('transactions')
            .select([
                'transactions.meetingId',
                'transactions.companyId',
                'transactions.contractAddress',
                'transactions.meetingLink',
                'transactions.titleMeeting',
                'transactions.startTimeMeeting',
                'transactions.endTimeMeeting',
                'transactions.shareholdersTotal',
                'transactions.shareholdersJoined',
                'transactions.joinedMeetingShares',
                'transactions.totalMeetingShares',
                'transactions.status',
                'transactions.type',
            ])
            .where('transactions.type = :type', {
                type: TRANSACTION_TYPE.UPDATE_PROPOSAL_MEETING,
            })
            .andWhere('transactions.status = :status', {
                status: TRANSACTION_STATUS.SUCCESS,
            })
            .andWhere(
                'NOT EXISTS (SELECT 1 FROM transactions AS t  WHERE t.meeting_id = transactions.meetingId AND t.type IN (:...types))',
                {
                    types: [TRANSACTION_TYPE.UPDATE_USER_PROPOSAL_MEETING],
                },
            )
            .getRawMany()

        const mappedTransactions = transactions.map((transaction) => {
            return TransactionMapper({
                transactions_title_meeting:
                    transaction.transactions_title_meeting,
                transactions_chain_id: transaction.transactions_chain_id,
                transactions_contract_address:
                    transaction.transactions_contract_address,
                transactions_meeting_link:
                    transaction.transactions_meeting_link,
                transactions_meeting_id: transaction.transactions_meeting_id,
                transactions_start_time_meeting:
                    transaction.transactions_start_time_meeting,
                transactions_end_time_meeting:
                    transaction.transactions_end_time_meeting,
                transactions_company_id: transaction.transactions_company_id,
                transactions_shareholder_total:
                    transaction.transactions_shareholder_total,
                transactions_shareholders_joined:
                    transaction.transactions_shareholders_joined,
                transactions_joined_meeting_shares:
                    transaction.transactions_joined_meeting_shares,
                transactions_total_meeting_shares:
                    transaction.transactions_total_meeting_shares,
                transactions_status: transaction.transactions_status,
                transactions_type: transaction.transactions_type,
            })
        })
        return mappedTransactions
    }
}
