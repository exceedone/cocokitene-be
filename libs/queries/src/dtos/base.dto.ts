import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class IdDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
    })
    id: number
}

export class WalletAddressDto {
    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    @ApiProperty({
        example: '0xB0C6abf8BAC799F27FE4D46ab2Ffb683129f59b1',
    })
    walletAddress: string
}

export class GetAllDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
    })
    page: number

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 10,
    })
    limit: number

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        example: 'search query',
    })
    searchQuery?: string
}
