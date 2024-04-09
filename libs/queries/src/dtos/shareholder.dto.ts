import {
    ArrayMinSize,
    IsArray,
    IsEmail,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { GetAllDto } from '@dtos/base.dto'
import { Sort_By_Order } from '@shares/constants'
import { Transform } from 'class-transformer'

export class GetAllShareholderDto extends GetAllDto {
    @IsOptional()
    @IsEnum(Sort_By_Order)
    @ApiProperty({
        required: false,
        example: Sort_By_Order.ASC,
        default: Sort_By_Order.ASC,
        enum: Sort_By_Order,
    })
    sortOrder?: Sort_By_Order
}

export class UpdateShareholderDto {
    @IsEmail()
    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'leopaulbn@gmail.com',
    })
    email?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        example: 'leopaul',
    })
    username?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        example: '0x9b500a4B354914d420c3D1497AEe4Ba9d45b7Df0',
    })
    @Transform(({ value }) => {
        return value?.toLowerCase()
    })
    walletAddress?: string

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        required: false,
        example: 100,
    })
    shareQuantity?: number

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        example: '0868071819',
    })
    phone?: string

    @IsArray()
    @IsOptional()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    @ApiProperty({
        required: false,
        example: [1, 3, 4],
    })
    roleIds?: number[]

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        required: false,
        example: 1,
    })
    statusId?: number

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'https://www.africau.edu/images/default/sample.pdf',
    })
    avatar: string
}
