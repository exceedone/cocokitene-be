import { Type } from 'class-transformer'
import { Sort_By_Order } from '@shares/constants'
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { GetAllDto } from '@dtos/base.dto'
import { SuperAdminCompanyDto } from '@dtos/user.dto'

export class UpdateCompanyDto {
    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Ttm',
        required: false,
    })
    companyName?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'NAB',
        required: false,
    })
    companyShortName?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'donate to our company to build a community center',
        required: false,
    })
    description?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'pham hung',
        required: false,
    })
    address?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'dev@exceedone.co.jp',
        required: false,
    })
    email?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '0989898989',
        required: false,
    })
    phone?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '(255) 555-01118',
        required: false,
    })
    fax?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '123456789',
        required: false,
    })
    taxNumber?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'service',
    })
    businessType?: string

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: false,
        example: 1,
    })
    statusId?: number

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'dev',
        required: false,
    })
    representativeUser?: string

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: false,
    })
    planId?: number

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: '2023-12-20',
    })
    dateOfCorporation?: string
}

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'NAB Innovation Centre Vietnam',
        required: true,
    })
    companyName: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Company description',
        required: false,
    })
    description: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'phamhung, ha noi, vietnam',
        required: true,
    })
    address: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'NAB',
        required: false,
    })
    companyShortName: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'nab@gmail.com',
        required: true,
    })
    email: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: '2021-12-20',
    })
    dateOfCorporation: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '0984533323',
        required: true,
    })
    phone: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: '(255) 555-44',
        required: false,
    })
    fax: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123456789',
        required: true,
    })
    taxNumber: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'service',
        required: false,
    })
    businessType: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Mr Dev',
        required: true,
    })
    representativeUser: string

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    statusId: number

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    planId: number

    @ApiProperty({
        required: true,
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => SuperAdminCompanyDto)
    superAdminCompany: SuperAdminCompanyDto
}

export class GetAllCompanyStatusDto extends GetAllDto {}
export class GetAllCompanyDto extends GetAllDto {
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

export class RegisterCompanyDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Mr Dev',
        required: true,
    })
    username: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'dev@exceedone.co.jp',
        required: true,
    })
    email: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'NAB Innovation Centre Vietnam',
        required: true,
    })
    company: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '0989898989',
        required: true,
    })
    phone: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'day la thong tin cong ty cua toi',
        required: false,
    })
    note?: string
}
