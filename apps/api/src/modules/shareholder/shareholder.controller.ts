import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserScope } from '@shares/decorators/user.decorator'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { User } from '@entities/user.entity'
import { PermissionEnum } from '@shares/constants'
import { Permission } from '@shares/decorators/permission.decorator'
import { ShareholderService } from './shareholder.service'
import {
    GetAllShareholderDto,
    UpdateShareholderDto,
} from '@dtos/shareholder.dto'

@Controller('shareholders')
@ApiTags('shareholders')
export class ShareholderController {
    constructor(private readonly shareholderService: ShareholderService) {}

    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.LIST_SHAREHOLDERS)
    async getAllSharehoderByCompany(
        @Query() getAllShareholderDto: GetAllShareholderDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const shareholders =
            await this.shareholderService.getAllShareholderInCompany(
                getAllShareholderDto,
                companyId,
            )
        return shareholders
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(
        PermissionEnum.DETAIL_SHAREHOLDERS,
        PermissionEnum.EDIT_SHAREHOLDERS,
    )
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getShareholderById(
        @Param('id') shareholderId: number,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const shareholderDetails =
            await this.shareholderService.getShareholderById(
                companyId,
                shareholderId,
            )
        return shareholderDetails
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.EDIT_SHAREHOLDERS)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async updateShareholder(
        @Param('id') shareholderId: number,
        @Body() updateShareholderDto: UpdateShareholderDto,
        @UserScope() user: User,
    ) {
        const companyId = user?.companyId
        const updateUser = await this.shareholderService.updateShareholder(
            companyId,
            shareholderId,
            updateShareholderDto,
        )
        return updateUser
    }
}
