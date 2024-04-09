import { GetAllDto } from '@dtos/base.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class GetAllPlanDto extends GetAllDto {}

export class UpdatePlanDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'free',
        required: true,
    })
    planName: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'it will help children be more active',
    })
    description?: string

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: '20',
        required: true,
    })
    maxStorage: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: '100',
        required: true,
    })
    maxMeeting: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: '10',
        required: true,
    })
    price: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example: '78',
        required: true,
    })
    maxShareholderAccount: number
}

export class CreatePlanDto extends UpdatePlanDto {}
