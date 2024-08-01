import { forwardRef, Module } from '@nestjs/common'
import { PersonnelVotingService } from './personnel-voting.service'
import { CandidateModule } from '../candidate/candidate.module'
import { MeetingModule } from '../meetings/meeting.module'
import { PersonnelVotingController } from './personnel-voting.controller'
import { UserModule } from '../users/user.module'
import { RoleMtgModule } from '../role-mtgs/role-mtg.module'
import { UserMeetingModule } from '../user-meetings/user-meeting.module'
import { VotingCandidateModule } from '../voting-candidate/voting-candidate.module'

@Module({
    controllers: [PersonnelVotingController],
    providers: [PersonnelVotingService],
    exports: [PersonnelVotingService],
    imports: [
        forwardRef(() => CandidateModule),
        forwardRef(() => MeetingModule),
        forwardRef(() => UserModule),
        forwardRef(() => MeetingModule),
        RoleMtgModule,
        UserMeetingModule,
        VotingCandidateModule,
    ],
})
export class PersonnelVotingModule {}
