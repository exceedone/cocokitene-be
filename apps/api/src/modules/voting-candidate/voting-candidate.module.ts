import { Module, forwardRef } from '@nestjs/common'
import { UserModule } from '../users/user.module'
import { UserMeetingModule } from '../user-meetings/user-meeting.module'
import { MeetingModule } from '../meetings/meeting.module'
import { VotingCandidateService } from './voting-candidate.service'
import { MeetingRoleMtgModule } from '../meeting-role-mtgs/meeting-role-mtg.module'
import { CandidateModule } from '../candidate/candidate.module'

@Module({
    imports: [
        forwardRef(() => UserModule),
        forwardRef(() => CandidateModule),
        UserMeetingModule,
        MeetingRoleMtgModule,
        forwardRef(() => MeetingModule),
    ],
    providers: [VotingCandidateService],
    exports: [VotingCandidateService],
})
export class VotingCandidateModule {}
