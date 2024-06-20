import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator'
import { ApiProperty, OmitType } from '@nestjs/swagger'

export class CreateMessageDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    meetingId: number

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    receiverId: number

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    senderId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'hello mn',
    })
    content: string

    @IsInt()
    @IsOptional()
    @ApiProperty({
        example: 1,
        required: false,
    })
    replyMessageId?: number
}

export class MessageDto extends OmitType(CreateMessageDto, ['senderId']) {}

export class CreateMessagePrivateDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    meetingId: number

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    receiverId: number

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example: 1,
        required: true,
    })
    senderId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'hello mn',
    })
    content: string

    @IsInt()
    @IsOptional()
    @ApiProperty({
        example: 1,
        required: false,
    })
    replyMessageId?: number
}

export class UpdateLastMessageUserSeenDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 1,
    })
    lastMessageIdSeen: number
}
