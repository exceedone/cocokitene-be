import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class UpdateServicePlanForCompanyDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '1',
        required: true,
    })
    companyId: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '1',
        required: true,
    })
    planId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: '2023-12-20',
    })
    expirationDate: string
}

export class ServicePlanForCompanyDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '1',
        required: true,
    })
    companyId: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '1',
        required: true,
    })
    planId: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '100',
        required: true,
    })
    meetingLimit: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '100',
        required: true,
    })
    accountLimit: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '10',
        required: true,
    })
    storageLimit: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: '2023-12-20',
    })
    expirationDate: string
}

export class UpdateCreatedServicePlanForCompanyDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '1',
        required: true,
    })
    companyId: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '100',
        required: true,
    })
    meetingCreated: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '100',
        required: true,
    })
    accountCreated: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '10',
        required: true,
    })
    storageUsed: number
}

export class UpdateStorageUsedDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: '0.5',
        required: true,
    })
    storageUsed: number
}
