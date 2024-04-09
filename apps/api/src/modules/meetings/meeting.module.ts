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

@Module({
    imports: [
        forwardRef(() => EmailModule),

        forwardRef(() => MeetingFileModule),
        ProposalModule,
        UserMeetingModule,
        forwardRef(() => UserModule),

        forwardRef(() => VotingModule),
        forwardRef(() => BoardMeetingModule),
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
