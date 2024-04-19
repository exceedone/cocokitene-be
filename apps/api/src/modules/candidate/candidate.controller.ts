import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CandidateService } from './candidate.service'

@Controller('candidates')
@ApiTags('candidates')
export class CandidateController {
    constructor(private readonly candidateService: CandidateService) {}
}
