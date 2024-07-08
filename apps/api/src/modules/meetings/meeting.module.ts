import { EmailModule } from '@api/modules/emails/email.module'
import { MeetingFileModule } from '@api/modules/meeting-files/meeting-file.module'
import { MeetingController } from '@api/modules/meetings/meeting.controller'
import { MeetingService } from '@api/modules/meetings/meeting.service'
import { ProposalModule } from '@api/modules/proposals/proposal.module'
import { UserMeetingModule } from '@api/modules/user-meetings/user-meeting.module'
import { UserModule } from '@api/modules/users/user.module'
import { VotingModule } from '@api/modules/votings/voting.module'
import {
    forwardRef,
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common'
import { MeetingStatusMiddleware } from '@shares/middlewares/meeting-status.middleware'
import { BoardMeetingModule } from '../board-meetings/board-meeting.module'
import { MeetingRoleMtgModule } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.module'
import { RoleMtgModule } from '@api/modules/role-mtgs/role-mtg.module'
import { ChatPermissionModule } from '@api/modules/chat-permission/chat-permission.module'
import { VotingCandidateModule } from '../voting-candidate/voting-candidate.module'

@Module({
    imports: [
        forwardRef(() => EmailModule),
        RoleMtgModule,
        forwardRef(() => MeetingFileModule),
        ProposalModule,
        UserMeetingModule,
        ChatPermissionModule,
        forwardRef(() => UserModule),
        MeetingRoleMtgModule,

        forwardRef(() => VotingModule),
        forwardRef(() => BoardMeetingModule),
        forwardRef(() => VotingCandidateModule),
    ],
    controllers: [MeetingController],
    providers: [MeetingService],
    exports: [MeetingService],
})
export class MeetingModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(MeetingStatusMiddleware)
            .exclude(
                {
                    path: '/api/meetings',
                    method: RequestMethod.POST,
                },
                {
                    path: '/api/meetings',
                    method: RequestMethod.GET,
                },
                {
                    path: '/api/meetings/:id/participants',
                    method: RequestMethod.GET,
                },
                {
                    path: '/api/meetings/attendance-meeting',
                    method: RequestMethod.POST,
                },
                {
                    path: '/api/meetings/send-email',
                    method: RequestMethod.POST,
                },
            )
            .forRoutes(MeetingController)
    }
}
