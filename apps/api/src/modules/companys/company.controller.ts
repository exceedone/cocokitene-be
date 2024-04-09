import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller('companys')
@ApiTags('companys')
export class CompanyController {}
