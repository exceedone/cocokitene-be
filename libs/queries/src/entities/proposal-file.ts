import { Proposal } from '@entities/proposal.entity'
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
@Entity('proposal_files')
export class ProposalFile extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'url', type: 'varchar', length: 255 })
    url: string

    @Column({
        nullable: false,
        name: 'proposal_id',
        type: 'integer',
        width: 11,
    })
    proposalId: number

    @DeleteDateColumn()
    deletedAt: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @ManyToOne(() => Proposal, (proposal) => proposal.proposalFiles)
    @JoinColumn({ name: 'proposal_id' })
    proposal: Proposal
}
