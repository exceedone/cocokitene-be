import { GetAllDto } from '@dtos/base.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class GetAllChatPermissionDto extends GetAllDto {}

export class PermissionChatInMeetingDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    permissionChatId: number
}

export class ChangePermissionChatInMeetingDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    userId: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    meetingId: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    companyId: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    permissionChatId: number
}
