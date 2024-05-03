import { Module, forwardRef } from '@nestjs/common'
import { CandidateController } from './candidate.controller'
import { CandidateService } from './candidate.service'
import { VotingCandidateModule } from '../voting-candidate/voting-candidate.module'
import { MeetingModule } from '../meetings/meeting.module'

@Module({
    controllers: [CandidateController],
    providers: [CandidateService],
    exports: [CandidateService],
    imports: [VotingCandidateModule, forwardRef(() => MeetingModule)],
})
export class CandidateModule {}
