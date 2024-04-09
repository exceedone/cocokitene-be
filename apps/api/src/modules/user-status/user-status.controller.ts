import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserStatusService } from '@api/modules/user-status/user-status.service'
import { GetAllUserStatusDto } from '@dtos/user-status.dto'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'

@Controller('user-status')
@ApiTags('user-status')
export class UserStatusController {
    constructor(private readonly userStatusService: UserStatusService) {}

    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @Permission(PermissionEnum.LIST_USER_STATUS)
    async getAllUserStatus(
        @Query() getAllUserStatusDto: GetAllUserStatusDto,
        // @fUserScope() user: User,
    ) {
        const userStatus = await this.userStatusService.getAllUserStatus(
            getAllUserStatusDto,
        )
        return userStatus
    }
}
