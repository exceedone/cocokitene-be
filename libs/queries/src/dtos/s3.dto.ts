import { ApiProperty } from '@nestjs/swagger'
import {
    FileTypes,
    FileTypesToFolderName,
} from '@shares/constants/meeting.const'
import { Type } from 'class-transformer'
import { IsEnum, IsString, ValidateNested } from 'class-validator'

export class MeetingFile {
    @ApiProperty()
    @IsString()
    fileName: string

    @ApiProperty({ example: FileTypesToFolderName.MEETING_INVITATION })
    @IsEnum(FileTypesToFolderName)
    fileType: FileTypesToFolderName
}

export class GetPresignedUrlDto {
    @ApiProperty({
        required: true,
        // isArray: true,
        type: [MeetingFile],
        example: [
            {
                fileName: '',
                fileType: FileTypes.MEETING_INVITATION,
            },
        ],
    })
    @ValidateNested()
    @Type(() => MeetingFile)
    meetingFiles: MeetingFile[]
}
