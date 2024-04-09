import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { StatePermisisionForRolesEnum } from '@shares/constants'

export class ChangeStatePermissionRoleDto {
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    roleId: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: StatePermisisionForRolesEnum.ENABLED,
    })
    state: StatePermisisionForRolesEnum
}

export class StateRoleOfPermissionDto {
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    @Type(() => Number)
    permissionId: number

    @IsArray()
    @ValidateNested({
        each: true,
    })
    @Type(() => ChangeStatePermissionRoleDto)
    @ApiProperty({
        type: [ChangeStatePermissionRoleDto],
    })
    changeStatePermissionForRole: ChangeStatePermissionRoleDto[]
}

export class RoleForPermissionDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StateRoleOfPermissionDto)
    @ApiProperty({
        type: [StateRoleOfPermissionDto],
    })
    assignmentRoleOfPermission: StateRoleOfPermissionDto[]
}

export class CreateRolePermissonDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 1,
    })
    roleId: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 1,
    })
    permissionId: number
}
