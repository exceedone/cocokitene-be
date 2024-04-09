import { IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserRoleDto {
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    userId: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    roleId: number
}
