import { ApiProperty } from '@nestjs/swagger'
import { UserMeetingStatusEnum } from '@shares/constants/meeting.const'
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateUserMeetingDto {
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
    meetingId: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    roleMtgId: number

    @IsOptional()
    @IsEnum(UserMeetingStatusEnum)
    @ApiProperty({
        required: false,
        enum: UserMeetingStatusEnum,
    })
    status?: UserMeetingStatusEnum
}

export class ParticipantDto extends CreateUserMeetingDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        required: true,
        example: 'leopaul',
    })
    username: string
}

export class UserMeetingDataSendToBlockchainDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    userId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
    })
    username: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
    })
    role: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'participate',
    })
    status: string
}

export class UserMeetingDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    roleMtgId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'shareholder',
    })
    roleName?: string

    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: [1, 2, 3],
    })
    userIds: number[]
}
