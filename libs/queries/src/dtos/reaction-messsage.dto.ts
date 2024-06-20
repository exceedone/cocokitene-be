import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class CreateReactionMessageDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: true,
    })
    userId: number

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: true,
    })
    messageId: number

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: true,
    })
    reactionIconId: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: false,
    })
    meetingId?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: false,
    })
    to?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: false,
    })
    from?: number
}

export class ReactionMessageDto extends OmitType(CreateReactionMessageDto, [
    'userId',
]) {}

export class UpdateReactionMessageDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: false,
    })
    userId?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: false,
    })
    messageId?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: false,
    })
    reactionIconId?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        required: false,
    })
    meetingId?: number
}
