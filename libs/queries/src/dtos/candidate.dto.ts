import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateCandidateDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'The Manifesto',
    })
    title: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'NVA',
    })
    candidateName: string

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    type: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    meetingId: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    creatorId: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 178,
    })
    notVoteYetQuantity: number
}

export class CandidateDto extends OmitType(CreateCandidateDto, [
    'meetingId',
    'creatorId',
    'notVoteYetQuantity',
]) {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    id?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: false })
    votedQuantity?: number = 0

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: false })
    unVotedQuantity?: number = 0

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: false })
    notVoteYetQuantity?: number = 0
}

export class CandidateUpdateDto {
    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'The Manifesto',
    })
    title?: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'NVA',
    })
    candidateName?: string

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        required: false,
        example: 1,
    })
    type?: number

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        required: false,
        example: 1,
    })
    meetingId?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: false })
    votedQuantity?: number = 0

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: false })
    unVotedQuantity?: number = 0

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: false })
    notVoteYetQuantity?: number = 0
}
