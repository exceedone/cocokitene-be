import {
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { Sort_By_Field, Sort_By_Order } from '@shares/constants/base.const'
import {
    MeetingTime,
    MeetingType,
    StatusMeeting,
} from '@shares/constants/meeting.const'
import { MeetingFileDto } from '@dtos/meeting-file.dto'
import { ProposalDto } from '@dtos/proposal.dto'
import { GetAllDto } from '@dtos/base.dto'

export class GetAllMeetingDto extends GetAllDto {
    @IsOptional()
    @IsEnum(Sort_By_Field)
    @ApiProperty({
        required: false,
        example: Sort_By_Field.START_TIME,
        default: Sort_By_Field.START_TIME,
        enum: Sort_By_Field,
    })
    sortField?: Sort_By_Field

    @IsOptional()
    @IsEnum(Sort_By_Order)
    @ApiProperty({
        required: false,
        example: Sort_By_Order.ASC,
        default: Sort_By_Order.ASC,
        enum: Sort_By_Order,
    })
    sortOrder?: Sort_By_Order

    @IsNotEmpty()
    @IsEnum(MeetingTime)
    @ApiProperty({
        required: false,
        example: MeetingTime.FUTURE,
        default: MeetingTime.FUTURE,
        enum: MeetingTime,
    })
    type: MeetingTime

    @IsNotEmpty()
    @IsEnum(MeetingType)
    @ApiProperty({
        required: true,
        enum: MeetingType,
    })
    meetingType: MeetingType
}

export class CreateMeetingDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '2nd Ordinary General Meeting of Shareholders',
        required: true,
    })
    title: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Note change of meeting',
        required: false,
    })
    note: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'https://meet.google.com/mhu-gupg-oux',
        required: true,
    })
    meetingLink: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: '2023-12-20 15:00:00',
    })
    startTime: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: '2023-12-20 16:00:00',
    })
    endTime: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: '2023-12-20 16:00:00',
    })
    endVotingTime: string

    @ApiProperty({
        required: true,
        type: [MeetingFileDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => MeetingFileDto)
    meetingMinutes: MeetingFileDto[]

    @ApiProperty({
        required: true,
        type: [MeetingFileDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => MeetingFileDto)
    meetingInvitations: MeetingFileDto[]

    @ApiProperty({
        required: true,
        type: [ProposalDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => ProposalDto)
    resolutions: ProposalDto[]

    @ApiProperty({
        required: true,
        type: [ProposalDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => ProposalDto)
    amendmentResolutions: ProposalDto[]

    @IsArray()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: true,
        example: [1, 2],
    })
    hosts: number[]

    @IsArray()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: true,
        example: [1, 2],
    })
    controlBoards: number[]

    @IsArray()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: true,
        example: [1, 2, 3],
    })
    directors: number[]

    @IsArray()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: true,
        example: [1, 2, 3, 4, 5],
    })
    administrativeCouncils: number[]

    @IsArray()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: true,
        example: [1, 2, 3, 4],
    })
    shareholders: number[]
}

export class IdMeetingDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    @Type(() => Number)
    meetingId: number
}

export class AttendMeetingDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    meetingId: number
}

export class UpdateMeetingDto {
    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '2nd Ordinary General Meeting of Shareholders',
        required: false,
    })
    title?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Note of meeting',
        required: false,
    })
    note?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'https://meet.google.com/mhu-gupg-oux',
        required: false,
    })
    meetingLink?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: '2023-12-20 15:00:00',
    })
    startTime?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: '2023-12-20 16:00:00',
    })
    endTime?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: '2023-12-20 16:00:00',
    })
    endVotingTime?: string

    @IsOptional()
    @IsEnum(StatusMeeting)
    @ApiProperty({
        required: false,
        enum: StatusMeeting,
    })
    status?: StatusMeeting

    @IsOptional()
    @ApiProperty({
        required: false,
        type: [MeetingFileDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => MeetingFileDto)
    meetingMinutes?: MeetingFileDto[]

    @IsOptional()
    @ApiProperty({
        required: false,
        type: [MeetingFileDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => MeetingFileDto)
    meetingInvitations?: MeetingFileDto[]

    @IsOptional()
    @ApiProperty({
        required: false,
        type: [ProposalDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => ProposalDto)
    resolutions?: ProposalDto[]

    @IsOptional()
    @ApiProperty({
        required: false,
        type: [ProposalDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => ProposalDto)
    amendmentResolutions?: ProposalDto[]

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: false,
        example: [1, 2],
    })
    hosts?: number[]

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: false,
        example: [1, 2],
    })
    controlBoards?: number[]

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: false,
        example: [1, 2, 10],
    })
    directors?: number[]

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: false,
        example: [1, 2, 3, 4, 5],
    })
    administrativeCouncils?: number[]

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @ApiProperty({
        required: false,
        example: [1, 2, 3, 4],
    })
    shareholders?: number[]
}
