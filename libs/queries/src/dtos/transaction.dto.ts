import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateTransactionDto {
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({
        required: true,
        example: 1,
    })
    chainId: number

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '0x53537d9660647c48598533c15c9bbc6c4d149aa0',
    })
    contractAddress: string

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
        example: '1716794897128',
    })
    keyQuery: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '85b5ab0df489fd6807b050d6806b3e66',
    })
    detailMeetingHash: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '85b5ab0df489fd6807b050d6806b3e67',
    })
    basicInformationMeetingHash: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '85b5ab0df489fd6807b050d6806b3e69',
    })
    fileMeetingHash: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '85b5ab0df489fd6807b050d6806b3e70',
    })
    proposalMeetingHash: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '85b5ab0df489fd6807b050d6806b3e71',
    })
    votedProposalHash: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '85b5ab0df489fd6807b050d6806b3e72',
    })
    candidateHash: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '85b5ab0df489fd6807b050d6806b3e72',
    })
    votedCandidateHash: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: '85b5ab0df489fd6807b050d6806b3e73',
    })
    participantHash: string
}
