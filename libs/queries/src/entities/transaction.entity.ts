import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import {
    TRANSACTION_STATUS,
    TRANSACTION_TYPE,
} from '@shares/constants/transaction.const'
import { ProposalTransaction } from '@entities/proposal-transaction.entity'
import { FileProposalTransaction } from '@entities/file-proposal-transaction.entity'

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
        name: 'meeting_link',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    meetingLink: string

    @Column({
        name: 'title_meeting',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    titleMeeting: string

    @Column({
        name: 'meeting_id',
        type: 'integer',
        width: 11,
        nullable: false,
    })
    meetingId: number

    @Column({
        name: 'start_time_meeting',
        type: 'integer',
        width: 11,
        nullable: false,
    })
    startTimeMeeting: number

    @Column({
        name: 'end_time_meeting',
        type: 'integer',
        width: 11,
        nullable: false,
    })
    endTimeMeeting: number

    @Column({
        name: 'company_id',
        type: 'integer',
        width: 11,
        nullable: true,
    })
    companyId: number

    @Column({
        name: 'shareholder_total',
        type: 'integer',
        width: 11,
        nullable: true,
    })
    shareholdersTotal: number

    @Column({
        name: 'shareholders_joined',
        type: 'integer',
        width: 11,
        nullable: true,
    })
    shareholdersJoined: number

    @Column({
        name: 'joined_meeting_shares',
        type: 'integer',
        width: 11,
        nullable: true,
    })
    joinedMeetingShares: number

    @Column({
        name: 'total_meeting_shares',
        type: 'integer',
        width: 11,
        nullable: true,
    })
    totalMeetingShares: number

    @Column({
        nullable: false,
        type: 'enum',
        enum: TRANSACTION_STATUS,
        default: TRANSACTION_STATUS.PENDING,
    })
    status: TRANSACTION_STATUS

    @Column({ name: 'tx_hash', type: 'varchar', length: 255, nullable: true })
    txHash: string
    @Column({
        nullable: false,
        type: 'enum',
        enum: TRANSACTION_TYPE,
    })
    type: TRANSACTION_TYPE

    @OneToMany(
        () => ProposalTransaction,
        (proposalTransaction) => proposalTransaction.meeting,
    )
    proposalTransactions: ProposalTransaction[]

    @OneToMany(
        () => FileProposalTransaction,
        (fileProposalTransaction) => fileProposalTransaction.meeting,
    )
    fileOfProposals: FileProposalTransaction[]

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
