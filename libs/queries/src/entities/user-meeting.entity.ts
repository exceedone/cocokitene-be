import { Meeting } from '@entities/meeting.entity'
import { User } from '@entities/user.entity'
import { UserMeetingStatusEnum } from '@shares/constants/meeting.const'
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { RoleMtg } from '@entities/role-mtg.entity'

@Entity('user_meetings')
export class UserMeeting extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'user_id', type: 'integer', width: 11 })
    userId: number

    @Column({ nullable: false, name: 'meeting_id', type: 'integer', width: 11 })
    meetingId: number

    @Column({
        name: 'status',
        type: 'enum',
        enum: UserMeetingStatusEnum,
        nullable: false,
        default: UserMeetingStatusEnum.ABSENCE,
    })
    status: UserMeetingStatusEnum

    @Column({
        name: 'role_mtg_id',
        type: 'integer',
        width: 11,

        nullable: false,
    })
    roleMtgId: number

    @Column({
        name: 'quantity_share',
        type: 'integer',
        width: 11,
        nullable: true,
    })
    quantityShare: number

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ManyToOne(() => Meeting)
    @JoinColumn({
        name: 'meeting_id',
    })
    meeting: Meeting

    @ManyToOne(() => RoleMtg)
    @JoinColumn({ name: 'role_mtg_id' })
    roleMtg: RoleMtg

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
