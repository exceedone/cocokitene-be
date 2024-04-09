import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { forwardRef, Module } from '@nestjs/common'
import { UserModule } from '@api/modules/users/user.module'

@Module({
    imports: [forwardRef(() => UserModule)],
    providers: [UserMeetingService],
    exports: [UserMeetingService],
})
export class UserMeetingModule {}
