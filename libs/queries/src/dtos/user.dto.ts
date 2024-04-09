import {
    ArrayMinSize,
    IsArray,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { GetAllDto } from '@dtos/base.dto'
import { Sort_By_Order } from '@shares/constants'

export class UpdateUserDto {
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

export class UpdateOwnProfileDto extends OmitType(UpdateUserDto, [
    'roleIds',
    'statusId',
    'shareQuantity',
]) {}
export class GetUserByWalletAddressDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '0x9b500a4B354914d420c3D1497AEe4Ba9d45b7Df0',
        required: true,
    })
    @Transform(({ value }) => {
        return value?.toLowerCase()
    })
    walletAddress: string
}

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'leopaulbn@gmail.com',
    })
    email: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 'leopaul',
    })
    username: string

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
    phone: string

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    @ApiProperty({
        required: true,
        example: [1, 3, 4],
    })
    roleIds: number[]

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 1,
    })
    statusId: number

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: true,
        example:
            'https://i.seadn.io/gcs/files/86ba42e7b54bcdfd6fb2c6fc7d1f2fc3.jpg',
    })
    avatar: string
}

export class GetAllUsersDto extends GetAllDto {
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

export class SuperAdminDto {
    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'MrAnhPhuong',
        required: false,
    })
    username?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '0xB0C6abf8BAC799F27FE4D46ab2Ffb683129f59b1',
        required: false,
    })
    walletAddress?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'nguyenkien123ns@gmail.com',
        required: false,
    })
    email?: string

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: false,
        example: 2,
    })
    statusId?: number
}

export class CreateSuperAdminCompanyDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'VuongLQ',
        required: true,
    })
    username: string

    // @IsNotEmpty()
    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '0xc3899509f0A71e69b13c59bf76AB6DAC61B0AaB6',
        required: false,
    })
    walletAddress: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'vuonglq@gmail.com',
        required: true,
    })
    email: string

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 2,
    })
    statusId: number

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    companyId: number
}
export class SuperAdminCompanyDto extends OmitType(CreateSuperAdminCompanyDto, [
    'companyId',
]) {}
