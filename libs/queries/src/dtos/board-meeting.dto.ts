import { ApiProperty } from '@nestjs/swagger'
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { MeetingFileDto } from './meeting-file.dto'
import { Type } from 'class-transformer'
import { ProposalDto } from './proposal.dto'
import { UserMeetingDto } from '@dtos/user-meeting.dto'
import { StatusMeeting } from '@shares/constants/meeting.const'
import { PersonnelVotingDto } from './personnel-voting.dto'

export class CreateBoardMeetingDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'Create Board Meeting',
    })
    title: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Note of BoardMeeting',
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
        example: 'Meeting_123456789',
        required: true,
    })
    meetingCode: string

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
    managementAndFinancials: ProposalDto[]

    @ApiProperty({
        required: true,
        type: [ProposalDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => ProposalDto)
    elections: ProposalDto[]

    //executiveOfficerElection
    @ApiProperty({
        required: true,
        type: [PersonnelVotingDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => PersonnelVotingDto)
    personnelVoting: PersonnelVotingDto[]

    @ApiProperty({
        required: true,
        type: [UserMeetingDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => UserMeetingDto)
    participants: UserMeetingDto[]
}

export class UpdateBoardMeetingDto {
    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Update Board Meeting',
        required: false,
    })
    title?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Update note of BoardMeeting',
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
        example: '2023-12-20 15:00:00',
        required: false,
    })
    startTime?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '2024-12-20 16:00:00',
        required: false,
    })
    endTime?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '2024-12-20 16:00:00',
        required: false,
    })
    endVotingTime?: string

    @IsOptional()
    @IsEnum(StatusMeeting)
    @ApiProperty({
        enum: StatusMeeting,
        required: false,
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
    managementAndFinancials?: ProposalDto[]

    @IsOptional()
    @ApiProperty({
        required: false,
        type: [ProposalDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => ProposalDto)
    elections?: ProposalDto[]

    //executiveOfficerElection
    @IsOptional()
    @ApiProperty({
        required: false,
        type: [PersonnelVotingDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => PersonnelVotingDto)
    personnelVoting?: PersonnelVotingDto[]

    @IsOptional()
    @ApiProperty({
        required: false,
        type: [UserMeetingDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => UserMeetingDto)
    participants?: UserMeetingDto[]
}
