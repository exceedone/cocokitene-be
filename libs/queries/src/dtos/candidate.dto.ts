import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateCandidateDto {
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
    personnelVotingId: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 178,
    })
    notVoteYetQuantity: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    creatorId: number
}

export class CandidateDto extends OmitType(CreateCandidateDto, [
    'creatorId',
    'notVoteYetQuantity',
    'personnelVotingId',
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
        example: 'NVA',
    })
    candidateName?: string

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        required: false,
        example: 1,
    })
    personnelVotingId?: number

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
