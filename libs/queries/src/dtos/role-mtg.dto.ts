import { GetAllDto } from '@dtos/base.dto'
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator'
import { TypeRoleMeeting } from '@shares/constants'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class GetAllRoleMtgDto extends GetAllDto {}

export class GetAllRoleMtgByTypeRoleMtgDto extends GetAllDto {
    @IsNotEmpty()
    @IsEnum(TypeRoleMeeting)
    @ApiProperty({
        required: true,
        enum: TypeRoleMeeting,
    })
    type: TypeRoleMeeting
}

export class CreateRoleMtgDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'administrator',
        required: true,
    })
    roleName: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example:
            'the user with this right can create role meeting in the company',
        required: false,
    })
    description?: string

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: true,
    })
    companyId: number

    @IsEnum(TypeRoleMeeting)
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: TypeRoleMeeting.SHAREHOLDER_MTG,
        enum: TypeRoleMeeting,
    })
    type: TypeRoleMeeting
}

export class RoleMtgDto extends OmitType(CreateRoleMtgDto, ['companyId']) {}
export class UpdateRoleMtgDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'administrator',
        required: false,
    })
    roleName?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        example:
            'the user with this right can create role meeting in the company',
        required: false,
    })
    description?: string

    @IsEnum(TypeRoleMeeting)
    @IsOptional()
    @ApiProperty({
        required: false,
        enum: TypeRoleMeeting,
    })
    type?: TypeRoleMeeting
}
