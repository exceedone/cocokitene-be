import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PermissionEnum } from '@shares/constants'
import { PermissionService } from '@api/modules/permissions/permission.service'
import { Permission } from '@shares/decorators/permission.decorator'
import { GetAllPermissionDto } from '@dtos/permissions.dto'

@Controller('permissions')
@ApiTags('permissions')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}
    @Get('/normal-permission')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async getAllNormalPermissions(
        @Query() getAllPermissionDto: GetAllPermissionDto,
    ) {
        const filterdNormalPermissions =
            await this.permissionService.getAllNormalPermissions(
                getAllPermissionDto,
            )
        return filterdNormalPermissions
    }

    @Get('/internal-permission')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async getAllInternalPermissions(
        @Query() getAllPermissionDto: GetAllPermissionDto,
    ) {
        const internlaPermissions =
            await this.permissionService.getAllInternalPermissions(
                getAllPermissionDto,
            )
        return internlaPermissions
    }
}
