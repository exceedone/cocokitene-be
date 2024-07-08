import { Transaction } from '@entities/transaction.entity'
import { Injectable } from '@nestjs/common'
import { TransactionRepository } from '@repositories/transaction.repository'

@Injectable()
export class TransactionService {
    constructor(
        private readonly transactionRepository: TransactionRepository,
    ) {}

    async getTransactionByMeetingId(meetingId: number): Promise<Transaction> {
        const transaction =
            await this.transactionRepository.getTransactionByMeetingId(
                meetingId,
            )

        return transaction
    }
}
