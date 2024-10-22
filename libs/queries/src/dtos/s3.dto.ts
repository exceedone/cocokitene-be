import { ApiProperty } from '@nestjs/swagger'
import {
    FileTypes,
    FileTypesToFolderName,
} from '@shares/constants/meeting.const'
import { FolderType } from '@shares/constants/s3.const'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator'

export class MeetingFile {
    @ApiProperty()
    @IsEnum(FolderType)
    folderType: FolderType

    @ApiProperty()
    @IsOptional()
    @IsString()
    subFolder: string

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
                folderType: FolderType.MEETING,
                subFolder: '',
            },
        ],
    })
    @ValidateNested()
    @Type(() => MeetingFile)
    meetingFiles: MeetingFile[]
}
