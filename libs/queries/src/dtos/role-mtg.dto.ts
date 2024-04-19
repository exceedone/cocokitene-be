import { GetAllDto } from '@dtos/base.dto'
import { IsEnum, IsOptional } from 'class-validator'
import { TypeRoleMeeting } from '@shares/constants'
import { ApiProperty } from '@nestjs/swagger'

export class GetAllRoleMtgDto extends GetAllDto {
    @IsOptional()
    @IsEnum(TypeRoleMeeting)
    @ApiProperty({
        required: false,
        enum: TypeRoleMeeting,
    })
    type?: TypeRoleMeeting
}
