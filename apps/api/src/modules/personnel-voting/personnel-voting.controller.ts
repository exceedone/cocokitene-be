import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PersonnelVotingService } from './personnel-voting.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'
import { VotePersonnelDto } from '@dtos/personnel-voting.dto'

@Controller('personnel-voting')
@ApiTags('personnel-voting')
export class PersonnelVotingController {
    constructor(private personnelVotingService: PersonnelVotingService) {}

    @Post('/vote/:personnelId')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_MEETING)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async votePersonnel(
        @Param('personnelId') personnelId: number,
        @Body() votePersonnelDto: VotePersonnelDto,
        @UserScope() user: User,
    ) {
        const userId = user.id
        const companyId = user.companyId
        const personnelVoting =
            await this.personnelVotingService.voteCandidateInPersonnel(
                companyId,
                userId,
                personnelId,
                votePersonnelDto,
            )
        return personnelVoting
    }
}
