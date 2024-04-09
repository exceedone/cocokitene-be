import { Election } from '@entities/election.entity'
import { PartialType } from '@nestjs/mapped-types'
import { ElectionEnum } from '@shares/constants'

export class InsertElectionDto extends PartialType(Election) {}

export const electionData: InsertElectionDto[] = [
    {
        status: ElectionEnum.VOTE_OF_CONFIDENCE,
        description: 'vote of confidence',
    },
    {
        status: ElectionEnum.VOTE_OF_NOT_CONFIDENCE,
        description: 'vote of not confidence',
    },
]
