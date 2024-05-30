import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '@entities/user.entity'
import { Message } from '@entities/message.entity'
import { Emoji } from '@entities/reaction-icon.entity'

@Entity('reaction_messages')
export class Reaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'user_id', type: 'integer', width: 11 })
    userId: number

    @Column({ nullable: false, name: 'message_id', type: 'integer', width: 11 })
    messageId: number

    @Column({
        nullable: false,
        name: 'reaction_icon_id',
        type: 'integer',
        width: 11,
    })
    emojiId: number

    @ManyToOne(() => User, (user) => user.reactions)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ManyToOne(() => Message, (message) => message.reactions)
    @JoinColumn({
        name: 'message_id',
    })
    message: Message

    @ManyToOne(() => Emoji, (emoji) => emoji.reactions)
    @JoinColumn({
        name: 'reaction_icon_id',
    })
    emoji: Emoji
}
