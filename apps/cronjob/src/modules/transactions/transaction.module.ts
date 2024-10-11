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
import { CandidateRepository } from '@repositories/nominees.repository'
import { VotingCandidateRepository } from '@repositories/voting-board-members.repository'
import { MeetingRoleMtgRepository } from '@repositories/meeting-role-relations.repository'
import { RoleMtgRepository } from '@repositories/meeting-role.repository'
import { PersonnelVotingRepository } from '@repositories/personnel-voting.repository'
import { S3Module } from '@api/modules/s3/s3.module'
import { ServiceSubscriptionRepository } from '@repositories/service-subscription.repository'
import { CompanyServicePlanRepository } from '@repositories/company-service.repository'
import { PlanRepository } from '@repositories/plan.repository'
import { CompanyRepository } from '@repositories/company.repository'
import { ConfigService } from '@nestjs/config'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { join } from 'path'
import { UserRepository } from '@repositories/user.repository'

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
    PersonnelVotingRepository,
    ServiceSubscriptionRepository,
    CompanyServicePlanRepository,
    PlanRepository,
    CompanyRepository,
    UserRepository,
])

@Module({
    imports: [
        Repositories,
        MyLoggerModule,
        S3Module,
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get('email.host'),
                    port: configService.get('email.port'),
                    secure: configService.get('email.secure'),
                    auth: {
                        user: configService.get('email.auth.user'),
                        pass: configService.get('email.auth.password'),
                    },
                },
                defaults: {
                    from: configService.get('email.auth.user'),
                },
                template: {
                    dir: join(__dirname, 'modules/emails/templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [TransactionService],
    exports: [TransactionService],
})
export class TransactionModule {}
