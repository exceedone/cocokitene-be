import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { TRANSACTION_TYPE } from '@shares/constants'

export class CreateTransactionDto {
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    chainId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'the meeing about product strategy meeting',
    })
    titleMeeting: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 'https://google.com',
    })
    meetingLink: string

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    meetingId: number

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    companyId: number

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    shareholdersJoined: number

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    joinedMeetingShares: number

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    totalMeetingShares: number

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    shareholdersTotal: number

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1734543456,
    })
    startTimeMeeting: number

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1734543456,
    })
    endTimeMeeting: number

    @IsNotEmpty()
    @IsEnum(TRANSACTION_TYPE)
    @ApiProperty({
        required: true,
        example: TRANSACTION_TYPE.CREATE_MEETING,
        enum: TRANSACTION_TYPE,
    })
    type: TRANSACTION_TYPE

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '0x53537d9660647c48598533c15c9bbc6c4d149aa0',
    })
    contractAddress: string
}
