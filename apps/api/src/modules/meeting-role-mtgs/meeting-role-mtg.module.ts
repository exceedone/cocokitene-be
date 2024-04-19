import { Module } from '@nestjs/common'
import { MeetingRoleMtgService } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.service'

@Module({
    imports: [],
    providers: [MeetingRoleMtgService],
    exports: [MeetingRoleMtgService],
})
export class MeetingRoleMtgModule {}
