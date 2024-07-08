import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Company } from '@entities/company.entity'
import { User } from '@entities/user.entity'
import { MeetingFile } from '@entities/meeting-file.entity'
import { Proposal } from '@entities/proposal.entity'
import { MeetingType, StatusMeeting } from '@shares/constants/meeting.const'
import { Candidate } from './candidate.entity'
import { MeetingRoleMtg } from '@entities/meeting-role-mtg.entity'
import { ChatPermission } from '@entities/chat-permission.entity'
import { Transaction } from './transaction.entity'

@Entity('meetings')
export class Meeting extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
    title: string

    @Column({
        name: 'note',
        type: 'text',
        nullable: true,
    })
    note: string

    @Column({
        type: 'datetime',
        nullable: true,
        name: 'start_time',
    })
    startTime: Date

    @Column({
        type: 'datetime',
        nullable: true,
        name: 'end_time',
    })
    endTime: Date

    @Column({
        type: 'datetime',
        nullable: true,
        name: 'end_voting_time',
    })
    endVotingTime: Date

    @Column({
        nullable: true,
        name: 'meeting_link',
        type: 'varchar',
        length: 255,
    })
    meetingLink: string

    @Column({
        nullable: false,
        name: 'status',
        type: 'enum',
        enum: StatusMeeting,
        default: StatusMeeting.NOT_HAPPEN,
    })
    status: StatusMeeting

    @Column({ nullable: false, name: 'company_id', type: 'integer', width: 11 })
    companyId: number

    @Column({ nullable: false, name: 'creator_id', type: 'integer', width: 11 })
    creatorId: number

    @Column({
        nullable: true,
        name: 'chat_permission_id',
        type: 'integer',
        width: 11,
    })
    chatPermissionId: number

    @Column({
        nullable: false,
        type: 'enum',
        name: 'type',
        enum: MeetingType,
    })
    type: MeetingType

    @ManyToOne(() => Company)
    @JoinColumn({
        name: 'company_id',
    })
    company: Company

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'creator_id',
    })
    creator: User

    @OneToMany(() => MeetingFile, (meetingFile) => meetingFile.meeting)
    meetingFiles: MeetingFile[]

    @OneToMany(() => Proposal, (proposal) => proposal.meeting)
    proposals: Proposal[]

    @OneToMany(() => Candidate, (candidate) => candidate.meeting)
    candidates: Candidate[]

    @OneToMany(() => MeetingRoleMtg, (meetingRoleMtg) => meetingRoleMtg.meeting)
    meetingRoleMtg: MeetingRoleMtg[]

    @ManyToOne(() => ChatPermission)
    @JoinColumn({
        name: 'chat_permission_id',
    })
    ChatPermission: ChatPermission

    @OneToOne(() => Transaction, (transaction) => transaction.meeting)
    transaction: Transaction
}
