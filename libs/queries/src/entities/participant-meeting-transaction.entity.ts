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
import {
    MeetingRole,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { Meeting } from '@entities/meeting.entity'

@Entity('participant_meeting_transactions')
export class ParticipantMeetingTransaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'user_id', type: 'integer', width: 11 })
    userId: number

    @Column({
        name: 'username',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    username: string

    @Column({
        name: 'status',
        type: 'enum',
        enum: UserMeetingStatusEnum,
        nullable: false,
    })
    status: UserMeetingStatusEnum

    @Column({
        name: 'role',
        type: 'enum',
        enum: MeetingRole,
        nullable: false,
    })
    role: MeetingRole

    @Column({
        nullable: false,
        name: 'meeting_id',
        type: 'integer',
        width: 11,
    })
    meetingId: number

    @ManyToOne(() => Meeting)
    @JoinColumn({
        name: 'meeting_id',
    })
    meeting: Meeting

    @DeleteDateColumn()
    deletedAt: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
