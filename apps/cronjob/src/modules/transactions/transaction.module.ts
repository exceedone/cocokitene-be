import { Module } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { TypeOrmExModule } from '@shares/modules'
import { UserMeetingRepository } from '@repositories/meeting-participant.repository'
import { MeetingRepository } from '@repositories/meeting.repository'
import { ProposalRepository } from '@repositories/meeting-proposal.repository'
import { ProposalFileRepository } from '@repositories/proposal-file.repository'
import { TransactionRepository } from '@repositories/transaction.repository'
import { VotingRepository } from '@repositories/voting.repository'
import { MeetingFileRepository } from '@repositories/meeting-file.repository'
import { MyLoggerModule } from '@api/modules/loggers/logger.module'
import { CandidateRepository } from '@repositories/board-members.repository'
import { VotingCandidateRepository } from '@repositories/voting-board-members.repository'
import { MeetingRoleMtgRepository } from '@repositories/meeting-role-relations.repository'
import { RoleMtgRepository } from '@repositories/meeting-role.repository'

const Repositories = TypeOrmExModule.forCustomRepository([
    UserMeetingRepository,
    MeetingRepository,
    ProposalRepository,
    ProposalFileRepository,
    TransactionRepository,
    VotingRepository,
    MeetingFileRepository,
    CandidateRepository,
    VotingCandidateRepository,
    MeetingRoleMtgRepository,
    RoleMtgRepository,
])

@Module({
    imports: [Repositories, MyLoggerModule],
    providers: [TransactionService],
    exports: [TransactionService],
})
export class TransactionModule {}
