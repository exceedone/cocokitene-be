import { MeetingFileService } from '@api/modules/meeting-files/meeting-file.service'
import { Module, forwardRef } from '@nestjs/common'
import { MeetingFileController } from '@api/modules/meeting-files/meeting-file.controller'
import { MeetingModule } from '@api/modules/meetings/meeting.module'

@Module({
    imports: [forwardRef(() => MeetingModule)],
    controllers: [MeetingFileController],
    providers: [MeetingFileService],
    exports: [MeetingFileService],
})
export class MeetingFileModule {}
