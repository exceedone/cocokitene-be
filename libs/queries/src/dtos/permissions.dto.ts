import { GetAllDto } from '@dtos/base.dto'
import { OmitType } from '@nestjs/swagger'

export class GetAllPermissionDto extends OmitType(GetAllDto, [
    'page',
    'limit',
]) {}
