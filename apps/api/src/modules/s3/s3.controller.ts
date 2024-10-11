import { S3Service } from '@api/modules/s3/s3.service'
import { GetPresignedUrlDto } from '@dtos/s3.dto'
import { User } from '@entities/user.entity'
import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PermissionEnum } from '@shares/constants'
import { Permission } from '@shares/decorators/permission.decorator'
import { UserScope } from '@shares/decorators/user.decorator'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'

@Controller('s3')
@ApiTags('s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.BASIC_PERMISSION)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getPresignedUrl(
        @Query() getPresignedUrlDto: GetPresignedUrlDto,
        @UserScope() user: User,
    ) {
        const companyId = user.companyId

        const presignedUrl = await this.s3Service.getPresignedUrls(
            getPresignedUrlDto,
            companyId,
        )
        return presignedUrl
    }
}
