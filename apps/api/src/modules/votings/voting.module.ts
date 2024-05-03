import { MeetingRoleMtgModule } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.module'
import { forwardRef, Module } from '@nestjs/common'
import { VotingService } from '@api/modules/votings/voting.service'
import { UserModule } from '@api/modules/users/user.module'
import { UserMeetingModule } from '@api/modules/user-meetings/user-meeting.module'
import { RoleModule } from '@api/modules/roles/role.module'
import { MeetingModule } from '@api/modules/meetings/meeting.module'
import { RoleMtgModule } from '@api/modules/role-mtgs/role-mtg.module'

@Module({
    imports: [
        forwardRef(() => UserModule),
        RoleMtgModule,
        UserMeetingModule,
        RoleModule,
        MeetingRoleMtgModule,
        forwardRef(() => MeetingModule),
    ],
    providers: [VotingService],
    exports: [VotingService],
})
export class VotingModule {}
