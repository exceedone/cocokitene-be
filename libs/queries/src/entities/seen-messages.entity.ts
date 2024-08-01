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
import { User } from './user.entity'
import { Meeting } from './meeting.entity'
import { Message } from './message.entity'

@Entity('seen_messages')
export class UserSeenMessage extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        name: 'user_id',
        type: 'integer',
        width: 11,
    })
    userId: number

    @Column({
        nullable: false,
        name: 'meeting_id',
        type: 'integer',
        width: 11,
    })
    meetingId: number

    @Column({
        nullable: true,
        name: 'last_message_id',
        type: 'integer',
        width: 11,
    })
    lastMessageIdSeen: number

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

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

    @ManyToOne(() => Message)
    @JoinColumn({
        name: 'last_message_id',
    })
    messageIdSeen: Message
}
