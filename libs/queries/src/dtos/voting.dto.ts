import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { ApiProperty, OmitType } from '@nestjs/swagger'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { Type } from 'class-transformer'

export class CreateVoteProposalDto {
    @IsEnum(VoteProposalResult)
    @ApiProperty({
        required: true,
        enum: VoteProposalResult,
    })
    result: VoteProposalResult

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    userId: number

    @IsNumber()
    @ApiProperty({
        required: true,
        example: 1,
    })
    proposalId: number
}

export class VoteProposalDto extends OmitType(CreateVoteProposalDto, [
    'userId',
    'proposalId',
]) {}

export class VotingDataSendToBlockchainDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    userId: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        required: true,
    })
    result: string
}

export class CreateVotingTransactionDto extends CreateVoteProposalDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    votingId: number
}
