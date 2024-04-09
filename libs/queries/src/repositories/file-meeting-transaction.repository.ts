import { Repository } from 'typeorm'
import { FileMeetingTransaction } from '@entities/file-meeting-transaction.entity'
import { CustomRepository } from '@shares/decorators'
import { CreateFileOfMeetingTransactionDto } from '@dtos/meeting-file.dto'

@CustomRepository(FileMeetingTransaction)
export class FileMeetingTransactionRepository extends Repository<FileMeetingTransaction> {
    async createFileOfMeetingTransaction(
        createFileOfMeetingTransactionDto: CreateFileOfMeetingTransactionDto,
    ): Promise<FileMeetingTransaction> {
        const { url, meetingFileId, meetingId } =
            createFileOfMeetingTransactionDto

        const createFileOfMeetingTransaction = await this.create({
            url,
            meetingFileId,
            meetingId,
        })
        return await createFileOfMeetingTransaction.save()
    }

    async getFileOfMeetingTransactionsByMeetingId(
        meetingId: number,
    ): Promise<FileMeetingTransaction[]> {
        const fileOfMeetingTransactions = await this.find({
            where: {
                meetingId: meetingId,
            },
        })
        return fileOfMeetingTransactions
    }
}
