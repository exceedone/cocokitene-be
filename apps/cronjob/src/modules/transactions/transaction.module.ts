import { Module } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { TypeOrmExModule } from '@shares/modules'
import { UserMeetingRepository } from '@repositories/user-meeting.repository'
import { MeetingRepository } from '@repositories/meeting.repository'
import { ProposalRepository } from '@repositories/proposal.repository'
import { ProposalFileRepository } from '@repositories/proposal-file.repository'
import { TransactionRepository } from '@repositories/transaction.repository'
import { ParticipantMeetingTransactionRepository } from '@repositories/participant-meeting-transaction.repository'
import { ProposalTransactionRepository } from '@repositories/proposal-transaction.repository'
import { FileProposalTransactionRepository } from '@repositories/file-proposal-transaction.repository'
import { VotingTransactionRepository } from '@repositories/voting-transaction.repository'
import { VotingRepository } from '@repositories/voting.repository'
import { FileMeetingTransactionRepository } from '@repositories/file-meeting-transaction.repository'
import { MeetingFileRepository } from '@repositories/meeting-file.repository'
import { MyLoggerModule } from '@api/modules/loggers/logger.module'

const Repositories = TypeOrmExModule.forCustomRepository([
    UserMeetingRepository,
    MeetingRepository,
    ProposalRepository,
    ProposalFileRepository,
    TransactionRepository,
    ParticipantMeetingTransactionRepository,
    ProposalTransactionRepository,
    FileProposalTransactionRepository,
    VotingTransactionRepository,
    VotingRepository,
    MeetingFileRepository,
    FileMeetingTransactionRepository,
])

@Module({
    imports: [Repositories, MyLoggerModule],
    providers: [TransactionService],
    exports: [TransactionService],
})
export class TransactionModule {}
