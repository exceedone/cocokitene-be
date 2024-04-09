import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { RolePermissionService } from '@api/modules/role-permissions/role-permission.service'
import { RoleForPermissionDto } from '@dtos/role-permission.dto'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'
import { GetAllPermissionDto } from '@dtos/permissions.dto'

@Controller('role-permissions')
@ApiTags('role-permissions')
export class RolePermissionController {
    constructor(
        private readonly rolePermissionService: RolePermissionService,
    ) {}

    @Patch('')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async updateRoleForPermission(
        @Body() roleForPermissionDto: RoleForPermissionDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const updatedRoleForPermission =
            await this.rolePermissionService.updateRoleForPermission(
                roleForPermissionDto,
                companyId,
            )
        return updatedRoleForPermission
    }

    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async getAllRoleWithPermissions(
        @Query() getAllPermissionDto: GetAllPermissionDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        // const userId = user?.id
        const roleWithPermissions =
            await this.rolePermissionService.getAllRoleWithPermissions(
                getAllPermissionDto,
                companyId,
            )
        return roleWithPermissions
    }
}
