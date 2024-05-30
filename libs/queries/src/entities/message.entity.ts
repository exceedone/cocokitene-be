import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { User } from '@entities/user.entity'
import { Meeting } from '@entities/meeting.entity'
import { Reaction } from '@entities/reaction-messages.entity'

@Entity('messages')
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'meeting_id', type: 'integer', width: 11 })
    meetingId: number

    @Column({ nullable: false, name: 'sender_id', type: 'integer', width: 11 })
    senderId: number

    @Column({
        nullable: true,
        name: 'receiver_id',
        type: 'integer',
        width: 11,
    })
    receiverId: number

    @Column({
        name: 'content',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    content: string

    @Column({ name: 'reply_message_id', type: 'integer', nullable: true })
    replyMessageId: number

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'sender_id',
    })
    sender: User

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'receiver_id',
    })
    receiver: User

    @ManyToOne(() => Meeting)
    @JoinColumn({
        name: 'meeting_id',
    })
    meeting: Meeting

    @ManyToOne(() => Message)
    @JoinColumn({
        name: 'reply_message_id',
    })
    replyMessage: Message

    @OneToMany(() => Message, (message) => message.replyMessage)
    replies: Message[]

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @OneToMany(() => Reaction, (reaction) => reaction.user)
    reactions: Reaction[]
}
