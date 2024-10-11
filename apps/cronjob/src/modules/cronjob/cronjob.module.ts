import { Module } from '@nestjs/common'
import { TransactionModule } from '../transactions/transaction.module'
import { TypeOrmExModule } from '@shares/modules'
import { UserMeetingRepository } from '@repositories/meeting-participant.repository'
import { MeetingRepository } from '@repositories/meeting.repository'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { CronjobService } from './cronjob.service'
import { ProposalRepository } from '@repositories/meeting-proposal.repository'
import { ProposalFileRepository } from '@repositories/proposal-file.repository'
import { TransactionRepository } from '@repositories/transaction.repository'
import { BlockModule } from '../block/block.module'
import { MeetingCrawler } from './meeting-crawler'
import configuration from '@shares/config/configuration'
const Repositories = TypeOrmExModule.forCustomRepository([
    UserMeetingRepository,
    MeetingRepository,
    ProposalRepository,
    ProposalFileRepository,
    TransactionRepository,
])
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        // ConfigModule.forRoot(),
        ScheduleModule.forRoot(),
        BlockModule,
        Repositories,
        TransactionModule,
    ],
    providers: [CronjobService, MeetingCrawler],
    exports: [CronjobService, MeetingCrawler],
})
export class CronjobModule {}
