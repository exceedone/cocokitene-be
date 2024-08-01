import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { RoleService } from '@api/modules/roles/role.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import { UserScope } from '@shares/decorators/user.decorator'
import {
    GetAllInternalRoleDto,
    GetAllNormalRolesDto,
    RoleDto,
} from '@dtos/role.dto'
import { User } from '@entities/user.entity'

@Controller('roles')
@ApiTags('roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get('/normal-role')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.LIST_ACCOUNT, PermissionEnum.LIST_SHAREHOLDERS)
    async getAllNormalRoles(
        @Query() getAllNormalRolesDto: GetAllNormalRolesDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const normalRoles = await this.roleService.getAllNormalRoles(
            getAllNormalRolesDto,
            companyId,
        )
        return normalRoles
    }

    @Get('/internal-role')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async getAllInternalRoleInCompany(
        @Query() getAllInternalRoleDto: GetAllInternalRoleDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const roles = await this.roleService.getAllInternalRoleInCompany(
            getAllInternalRoleDto,
            companyId,
        )
        return roles
    }

    @Post('')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async createRoleHasPermissionInCompany(
        @Body() roleDto: RoleDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId

        const role = await this.roleService.createRoleHasPermissionInCompany({
            ...roleDto,
            companyId,
        })
        return role
    }
}
