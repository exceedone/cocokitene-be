import { forwardRef, Module } from '@nestjs/common'
import { VotingService } from '@api/modules/votings/voting.service'
import { UserModule } from '@api/modules/users/user.module'
import { UserMeetingModule } from '@api/modules/user-meetings/user-meeting.module'
import { RoleModule } from '@api/modules/roles/role.module'
import { MeetingModule } from '@api/modules/meetings/meeting.module'

@Module({
    imports: [
        forwardRef(() => UserModule),

        UserMeetingModule,
        RoleModule,
        forwardRef(() => MeetingModule),
    ],
    providers: [VotingService],
    exports: [VotingService],
})
export class VotingModule {}
