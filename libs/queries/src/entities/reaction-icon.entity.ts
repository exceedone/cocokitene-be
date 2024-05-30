import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { EmojiEnum } from '@shares/constants'
import { Reaction } from '@entities/reaction-messages.entity'

@Entity('reaction_icon_mst')
export class Emoji extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'key',
        type: 'enum',
        enum: EmojiEnum,
        nullable: false,
    })
    key: EmojiEnum

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @OneToMany(() => Reaction, (reaction) => reaction.user)
    reactions: Reaction[]
}
