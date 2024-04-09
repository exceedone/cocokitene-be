import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { FileProposalTransaction } from '@entities/file-proposal-transaction.entity'
import { FileOfProposalDto } from '@dtos/proposal-file.dto'

@CustomRepository(FileProposalTransaction)
export class FileProposalTransactionRepository extends Repository<FileProposalTransaction> {
    async createFileOfProposalTransaction(
        fileOfProposalDto: FileOfProposalDto,
    ): Promise<FileProposalTransaction> {
        const { url, proposalFileId, meetingId } = fileOfProposalDto

        const createFileOfProposalTransaction = await this.create({
            url,
            proposalFileId,
            meetingId,
        })
        return await createFileOfProposalTransaction.save()
    }

    async getFileOfProposalTransactionsByMeetingId(
        meetingId: number,
    ): Promise<FileProposalTransaction[]> {
        const fileOfProposalTransactions = await this.find({
            where: {
                meetingId: meetingId,
            },
        })
        return fileOfProposalTransactions
    }
}
