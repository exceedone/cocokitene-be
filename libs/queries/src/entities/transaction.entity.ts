import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { TRANSACTION_STATUS } from '@shares/constants/transaction.const'
import { Meeting } from './meeting.entity'

@Entity('transactions')
export class Transaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'chain_id',
        nullable: false,
        type: 'integer',
        width: 11,
    })
    chainId: number

    @Column({
        name: 'contract_address',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    contractAddress: string

    @Column({
        name: 'meeting_id',
        type: 'integer',
        width: 11,
        nullable: false,
    })
    meetingId: number

    @Column({
        name: 'key_query',
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true,
    })
    keyQuery: string

    @Column({
        name: 'detail_meeting_hash',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    detailMeetingHash: string

    @Column({
        name: 'basic_meeting_hash',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    basicInformationMeetingHash: string

    @Column({
        name: 'file_meeting_hash',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    fileMeetingHash: string

    @Column({
        name: 'proposal_meeting_hash',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    proposalMeetingHash: string

    @Column({
        name: 'voted_proposal_hash',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    votedProposalHash: string

    @Column({
        name: 'candidate_meeting_hash',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    candidateHash: string

    @Column({
        name: 'voted_candidate_hash',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    votedCandidateHash: string

    @Column({
        name: 'participant_hash',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    participantHash: string

    @Column({
        nullable: false,
        type: 'enum',
        enum: TRANSACTION_STATUS,
        default: TRANSACTION_STATUS.PENDING,
    })
    status: TRANSACTION_STATUS

    @Column({ name: 'tx_hash', type: 'varchar', length: 255, nullable: true })
    txHash: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @OneToOne(() => Meeting)
    @JoinColumn({
        name: 'meeting_id',
    })
    meeting: Meeting
}
