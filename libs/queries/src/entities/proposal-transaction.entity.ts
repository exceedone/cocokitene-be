import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Proposal } from '@entities/proposal.entity'
import { Meeting } from '@entities/meeting.entity'

@Entity('proposal_transactions')
export class ProposalTransaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        name: 'meeting_id',
        type: 'integer',
        width: 11,
    })
    meetingId: number

    @Column({
        name: 'title_proposal',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    titleProposal: string

    @Column({
        nullable: false,
        name: 'proposal_id',
        type: 'integer',
        width: 11,
    })
    proposalId: number

    @Column({
        nullable: false,
        name: 'voted_quantity',
        type: 'integer',
        width: 11,
    })
    votedQuantity: number

    @Column({
        nullable: false,
        name: 'un_voted_quantity',
        type: 'integer',
        width: 11,
    })
    unVotedQuantity: number

    @Column({
        nullable: false,
        name: 'not_vot_yet_quantity',
        type: 'integer',
        width: 11,
    })
    notVoteYetQuantity: number

    @ManyToOne(() => Meeting)
    @JoinColumn({
        name: 'meeting_id',
    })
    meeting: Meeting

    @OneToOne(() => Proposal)
    @JoinColumn({
        name: 'proposal_id',
    })
    proposal: Proposal

    @DeleteDateColumn()
    deletedAt: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
