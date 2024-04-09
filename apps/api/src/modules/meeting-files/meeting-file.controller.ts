import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    UseGuards,
} from '@nestjs/common'
import { MeetingFileService } from '@api/modules/meeting-files/meeting-file.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'

@Controller('meeting-files')
@ApiTags('meeting-files')
export class MeetingFileController {
    constructor(private readonly meetingFileService: MeetingFileService) {}
    @Delete(':meetingFileId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.EDIT_MEETING)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async deleteFile(
        @Param('meetingFileId') meetingFileId: number,
        @UserScope() user: User,
    ) {
        const userId = user?.id,
            companyId = user?.companyId
        const result = await this.meetingFileService.deleteMeetingFile(
            userId,
            companyId,
            meetingFileId,
        )
        return result
    }
}
