import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm'
import { User } from '@entities/user.entity'
import { Candidate } from './nominees.entity'
import { VoteProposalResult } from '@shares/constants/proposal.const'

@Entity('voted_for_nominee')
@Unique(['userId', 'votedForCandidateId', 'result'])
export class VotingCandidate extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'user_id', type: 'integer', width: 11 })
    userId: number

    @Column({
        nullable: false,
        name: 'nominees_id',
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

    @Column({
        nullable: false,
        name: 'quantity_share',
        type: 'integer',
        width: 11,
    })
    quantityShare: number

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ManyToOne(() => Candidate)
    @JoinColumn({
        name: 'nominees_id',
    })
    votedForCandidate: Candidate
}
