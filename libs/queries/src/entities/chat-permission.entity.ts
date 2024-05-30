import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { ChatPermissionEnum } from '@shares/constants'

@Entity('chat_permission_mst')
export class ChatPermission extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'name',
        type: 'enum',
        enum: ChatPermissionEnum,
        nullable: false,
        unique: true,
    })
    name: ChatPermissionEnum

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
}
