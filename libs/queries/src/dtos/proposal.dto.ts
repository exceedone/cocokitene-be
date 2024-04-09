import { ProposalFileDto } from '@dtos/proposal-file.dto'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { ProposalType } from '@shares/constants/proposal.const'
import { Type } from 'class-transformer'
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'

export class GetAllProposalDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
    })
    page: number

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({
        example: 10,
    })
    limit: number

    @IsEnum(ProposalType)
    @ApiProperty({
        required: true,
        enum: ProposalType,
    })
    type: ProposalType
}

export class CreateProposalDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'Approve the final budget',
    })
    title: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'Approve the final budget description',
    })
    description: string

    @ApiProperty({
        required: false,
        type: [ProposalFileDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => ProposalFileDto)
    files?: ProposalFileDto[]

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'Approve the final budget description',
    })
    oldDescription?: string

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

    @IsEnum(ProposalType)
    @ApiProperty({
        required: true,
        enum: ProposalType,
    })
    type: ProposalType

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 100,
    })
    notVoteYetQuantity: number
}

export class ProposalDto extends OmitType(CreateProposalDto, [
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

export class ProposalDtoUpdate {
    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'Approve the final budget',
    })
    title: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'Approve the final budget description',
    })
    description: string

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'Approve the final budget description',
    })
    oldDescription?: string

    @ApiProperty({
        required: false,
        type: [ProposalFileDto],
    })
    @ValidateNested({
        each: true,
    })
    @Type(() => ProposalFileDto)
    files?: ProposalFileDto[]

    @IsEnum(ProposalType)
    @ApiProperty({
        required: true,
        enum: ProposalType,
    })
    type: ProposalType

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
export class ResultVoteProposalDto extends OmitType(ProposalDto, [
    'type',
    'oldDescription',
    'description',
    'files',
    'id',
]) {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    proposalId?: number

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    meetingId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
        example: 'Approve the final budget',
    })
    titleProposal: string
}

export class ProposalDataSendToBlockchainDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    proposalId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: false,
        example: 'Approve the final budget',
    })
    titleProposal: string

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: true })
    votedQuantity: number

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: true })
    unVotedQuantity: number

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ required: true })
    notVoteYetQuantity: number
}
