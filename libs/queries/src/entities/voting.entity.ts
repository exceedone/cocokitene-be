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
import { Proposal } from '@entities/meeting-proposal.entity'
import { VoteProposalResult } from '@shares/constants/proposal.const'
@Entity('votings')
@Unique(['userId', 'proposalId'])
export class Voting extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'result',
        type: 'enum',
        nullable: false,
        enum: VoteProposalResult,
    })
    result: VoteProposalResult

    @Column({ nullable: false, name: 'user_id', type: 'integer', width: 11 })
    userId: number

    @Column({
        nullable: false,
        name: 'proposal_id',
        type: 'integer',
        width: 11,
    })
    proposalId: number

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

    @ManyToOne(() => Proposal)
    @JoinColumn({
        name: 'proposal_id',
    })
    proposal: Proposal
}
