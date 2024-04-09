import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ElectionService } from './election.service'
import { GetAllElectionStatusDto } from '@dtos/election.dto'

@Controller('elections')
@ApiTags('elections')
export class ElectionController {
    constructor(private readonly electionService: ElectionService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getAllElectionStatus(
        @Query() getAllElectionStatusDto: GetAllElectionStatusDto,
    ) {
        const electionStatus = await this.electionService.getAllElectionStatus(
            getAllElectionStatusDto,
        )
        return electionStatus
    }
}
