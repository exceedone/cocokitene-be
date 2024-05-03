import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import {
    GetAllRoleMtgByTypeRoleMtgDto,
    GetAllRoleMtgDto,
    RoleMtgDto,
    UpdateRoleMtgDto,
} from '@dtos/role-mtg.dto'
import { UserScope } from '@shares/decorators/user.decorator'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { User } from '@entities/user.entity'

@Controller('role-mtgs')
@ApiTags('role-mtgs')
export class RoleMtgController {
    constructor(private readonly roleMtgService: RoleMtgService) {}

    @Get('/types')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Permission(PermissionEnum.LIST_ROLE_MTG)
    async getAllRoleMtgByCompanyIdAndTypeRoleMtg(
        @Query() getAllRoleMtgByTypeRoleMtgDto: GetAllRoleMtgByTypeRoleMtgDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const roleMtgs =
            await this.roleMtgService.getAllRoleMtgByCompanyIdAndTypeRoleMtg(
                getAllRoleMtgByTypeRoleMtgDto,
                companyId,
            )
        return roleMtgs
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async getAllRoleMtgByCompanyId(
        @Query() getAllRoleMtgDto: GetAllRoleMtgDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const roleMtgs = await this.roleMtgService.getAllRoleMtgByCompanyId(
            getAllRoleMtgDto,
            companyId,
        )
        return roleMtgs
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    async createRoleMtg(
        @Body() roleMtgDto: RoleMtgDto,
        @UserScope() user: User,
    ) {
        const companyId = +user?.companyId
        const createdRoleMtg = await this.roleMtgService.createRoleMtgWithType({
            ...roleMtgDto,
            companyId,
        })
        return createdRoleMtg
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateRoleMtg(
        @Body() updateRoleMtgDto: UpdateRoleMtgDto,
        @UserScope() user: User,
        @Param('id') roleMtgId: number,
    ) {
        const companyId = +user?.companyId
        const updatedRoleMtg = await this.roleMtgService.updateRoleMtgWithType(
            roleMtgId,
            companyId,

            updateRoleMtgDto,
        )
        return updatedRoleMtg
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.SETTING_PERMISSION_FOR_ROLES)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getRoleMtgById(
        @Param('id') roleMtgId: number,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const roleMtg = await this.roleMtgService.getRoleMtgById(
            companyId,
            roleMtgId,
        )
        return roleMtg
    }
}
