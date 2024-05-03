import {
    BaseEntity,
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm'
import { User } from '@entities/user.entity'
import { Candidate } from './candidate.entity'
import { VoteProposalResult } from '@shares/constants/proposal.const'

@Entity('voting_candidate')
@Unique(['userId', 'votedForCandidateId'])
export class VotingCandidate extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'user_id', type: 'integer', width: 11 })
    userId: number

    @Column({
        nullable: false,
        name: 'voted_for_candidate_id',
        type: 'integer',
        width: 11,
    })
    votedForCandidateId: number

    @Column({
        name: 'result',
        type: 'enum',
        nullable: false,
        enum: VoteProposalResult,
    })
    result: VoteProposalResult

    @DeleteDateColumn()
    deletedAt: Date

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ManyToOne(() => Candidate)
    @JoinColumn({
        name: 'voted_for_candidate_id',
    })
    votedForCandidate: Candidate
}
