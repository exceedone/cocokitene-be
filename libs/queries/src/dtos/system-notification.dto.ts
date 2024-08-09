import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { GetAllDto } from './base.dto'

export class createSystemNotificationDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'System Notification',
        required: true,
    })
    title: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Notice of system maintenance',
        required: true,
    })
    content: string
}

export class getAllSysNotificationDto extends GetAllDto {}

export class updateSystemNotificationDto extends createSystemNotificationDto {}
