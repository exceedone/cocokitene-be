import { ApiProperty, OmitType } from '@nestjs/swagger'
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator'
import { FileTypes } from '@shares/constants/meeting.const'
import { Type } from 'class-transformer'

export class CreateMeetingFileDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'https://www.africau.edu/images/default/sample.pdf',
    })
    url: string

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    meetingId: number

    @IsEnum(FileTypes)
    @ApiProperty({
        required: true,
        enum: FileTypes,
    })
    fileType: FileTypes
}

export class MeetingFileDto extends OmitType(CreateMeetingFileDto, [
    'meetingId',
]) {
    @IsOptional()
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    id?: number
}

export class FileOfMeetingDataSendToBlockchainDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    meetingFileId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
    })
    url: string
}

export class CreateFileOfMeetingTransactionDto extends OmitType(
    CreateMeetingFileDto,
    ['fileType'],
) {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    meetingFileId: number
}
