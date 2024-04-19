import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import { GetAllRoleMtgDto } from '@dtos/role-mtg.dto'
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
        @Query() getAllRoleMtgDto: GetAllRoleMtgDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const roleMtgs =
            await this.roleMtgService.getAllRoleMtgByCompanyIdAndTypeRoleMtg(
                getAllRoleMtgDto,
                companyId,
            )
        return roleMtgs
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Permission(PermissionEnum.LIST_ROLE_MTG)
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
}
