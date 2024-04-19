import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MeetingRoleMtgService } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.service'

@Controller('meeting_role_mtgs')
@ApiTags('meeting_role_mtgs')
export class MeetingRoleMtgController {
    constructor(
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
    ) {}
}
