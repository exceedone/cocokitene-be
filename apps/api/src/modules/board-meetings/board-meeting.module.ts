import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
    forwardRef,
} from '@nestjs/common'
import { EmailModule } from '../emails/email.module'
import { MeetingFileModule } from '../meeting-files/meeting-file.module'
import { ProposalModule } from '../proposals/proposal.module'
import { UserMeetingModule } from '../user-meetings/user-meeting.module'
import { UserModule } from '../users/user.module'
import { VotingModule } from '../votings/voting.module'
import { BoardMeetingController } from './board-meeting.controller'
import { BoardMeetingService } from './board-meeting.service'
import { MeetingStatusMiddleware } from '@shares/middlewares/meeting-status.middleware'
import { MeetingModule } from '../meetings/meeting.module'
import { CandidateModule } from '../candidate/candidate.module'
import { MeetingRoleMtgModule } from '../meeting-role-mtgs/meeting-role-mtg.module'
import { RoleMtgModule } from '../role-mtgs/role-mtg.module'
import { VotingCandidateModule } from '../voting-candidate/voting-candidate.module'
import { ChatPermissionModule } from '../chat-permission/chat-permission.module'
import { PersonnelVotingModule } from '../personnel-voting/personnel-voting.module'
import { CompanyServicePlanModule } from '../company-service/company-service.module'

@Module({
    imports: [
        forwardRef(() => EmailModule),
        forwardRef(() => MeetingFileModule),
        ProposalModule,
        UserMeetingModule,
        CandidateModule,
        MeetingRoleMtgModule,
        RoleMtgModule,
        VotingCandidateModule,
        ChatPermissionModule,
        forwardRef(() => UserModule),
        forwardRef(() => VotingModule),
        forwardRef(() => MeetingModule),
        PersonnelVotingModule,
        CompanyServicePlanModule,
    ],
    controllers: [BoardMeetingController],
    providers: [BoardMeetingService],
    exports: [BoardMeetingService],
})
export class BoardMeetingModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(MeetingStatusMiddleware)
            .exclude(
                {
                    path: '/api/board-meetings',
                    method: RequestMethod.GET,
                },
                {
                    path: '/api/board-meetings/:id/participants',
                    method: RequestMethod.GET,
                },
                {
                    path: '/api/board-meetings',
                    method: RequestMethod.POST,
                },
                {
                    path: '/api/board-meetings/attendance-meeting',
                    method: RequestMethod.POST,
                },
                {
                    path: '/api/board-meetings/send-email',
                    method: RequestMethod.POST,
                },
            )
            .forRoutes(BoardMeetingController)
    }
}
