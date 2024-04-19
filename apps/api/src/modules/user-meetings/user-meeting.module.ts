import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { forwardRef, Module } from '@nestjs/common'
import { UserModule } from '@api/modules/users/user.module'
import { MeetingRoleMtgModule } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.module'
import { RoleMtgModule } from '@api/modules/role-mtgs/role-mtg.module'

@Module({
    imports: [
        forwardRef(() => UserModule),
        MeetingRoleMtgModule,
        RoleMtgModule,
    ],
    providers: [UserMeetingService],
    exports: [UserMeetingService],
})
export class UserMeetingModule {}
