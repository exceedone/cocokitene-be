import { ApiProperty } from '@nestjs/swagger'
import {
    MeetingRole,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
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

    @IsEnum(MeetingRole)
    @ApiProperty({
        required: true,
        enum: MeetingRole,
    })
    role: MeetingRole

    @IsOptional()
    @IsEnum(MeetingRole)
    @ApiProperty({
        required: false,
        enum: MeetingRole,
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
