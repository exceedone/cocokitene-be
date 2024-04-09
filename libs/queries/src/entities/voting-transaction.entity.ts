import {
    BaseEntity,
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Proposal } from '@entities/proposal.entity'
import { Voting } from '@entities/voting.entity'

@Entity('voting_transactions')
export class VotingTransaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        name: 'voting_id',
        type: 'integer',
        width: 11,
    })
    votingId: number

    @Column({
        name: 'result',
        type: 'varchar',
        nullable: false,
        length: 255,
    })
    result: string

    @Column({ nullable: false, name: 'user_id', type: 'integer', width: 11 })
    userId: number

    @Column({
        nullable: false,
        name: 'proposal_id',
        type: 'integer',
        width: 11,
    })
    proposalId: number

    @DeleteDateColumn()
    deletedAt: Date

    @OneToOne(() => Voting)
    @JoinColumn({
        name: 'voting_id',
    })
    voting: Voting

    @ManyToOne(() => Proposal)
    @JoinColumn({
        name: 'proposal_id',
    })
    proposal: Proposal
}
