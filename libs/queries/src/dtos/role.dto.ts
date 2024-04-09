import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { GetAllDto } from '@dtos/base.dto'

export class ActiveUserDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
    })
    id: number
}

export class CreateRoleDto {
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
            'the user with this right can create role of user in the system',
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

    @IsArray()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: true,
        example: [1, 2],
    })
    idPermissions: number[]
}
export class RoleDto extends OmitType(CreateRoleDto, ['companyId']) {}

export class GetAllNormalRolesDto extends GetAllDto {}
export class GetAllInternalRoleDto extends OmitType(GetAllDto, [
    'page',
    'limit',
]) {}
