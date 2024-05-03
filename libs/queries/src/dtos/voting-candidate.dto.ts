import { ApiProperty, OmitType } from '@nestjs/swagger'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { IsEnum, IsNumber } from 'class-validator'

export class CreateVoteCandidateDto {
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
    votedForCandidateId: number

    @IsEnum(VoteProposalResult)
    @ApiProperty({
        required: true,
        enum: VoteProposalResult,
    })
    result: VoteProposalResult
}

export class VoteCandidateDto extends OmitType(CreateVoteCandidateDto, [
    'userId',
    'votedForCandidateId',
]) {}
