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
import { ProposalFile } from '@entities/proposal-file'
import { Meeting } from '@entities/meeting.entity'

@Entity('file_proposal_transactions')
export class FileProposalTransaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        name: 'proposal_file_id',
        type: 'integer',
        width: 11,
    })
    proposalFileId: number

    @Column({
        nullable: false,
        name: 'meeting_id',
        type: 'integer',
        width: 11,
    })
    meetingId: number

    @Column({ nullable: false, name: 'url', type: 'varchar', length: 255 })
    url: string

    @ManyToOne(() => Meeting)
    @JoinColumn({
        name: 'meeting_id',
    })
    meeting: Meeting

    @OneToOne(() => ProposalFile)
    @JoinColumn({
        name: 'proposal_file_id',
    })
    proposalFile: ProposalFile

    @DeleteDateColumn()
    deletedAt: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
