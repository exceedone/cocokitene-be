import {
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CandidateService } from './candidate.service'
import { JwtAuthGuard } from '@shares/guards/jwt-auth.guard'
import { Permission } from '@shares/decorators/permission.decorator'
import { PermissionEnum } from '@shares/constants'
import { VoteCandidateDto } from '@dtos/voting-candidate.dto'
import { UserScope } from '@shares/decorators/user.decorator'
import { User } from '@entities/user.entity'
import { VotingCandidateService } from '../voting-candidate/voting-candidate.service'

@Controller('candidates')
@ApiTags('candidates')
export class CandidateController {
    constructor(
        private readonly candidateService: CandidateService,
        private readonly votingCandidate: VotingCandidateService,
    ) {}

    @Post('/vote/:candidateId')
    @UseGuards(JwtAuthGuard)
    @Permission(PermissionEnum.DETAIL_BOARD_MEETING)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async voteCandidate(
        @Param('candidateId') candidateId: number,
        @Query() voteCandidateDto: VoteCandidateDto,
        @UserScope() user: User,
    ) {
        const userId = user?.id
        const companyId = user?.companyId
        const candidate = await this.votingCandidate.voteCandidate(
            companyId,
            userId,
            candidateId,
            voteCandidateDto,
        )
        return candidate
    }
}
