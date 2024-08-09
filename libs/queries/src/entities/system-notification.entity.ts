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
import { SystemAdmin } from './system-admin.entity'

@Entity('system_notification')
export class SystemNotification extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'title',
        type: 'varchar',
        length: 255,
    })
    title: string

    @Column({
        name: 'content',
        type: 'text',
    })
    content: string

    @Column({
        nullable: false,
        name: 'create_system',
        type: 'integer',
        width: 11,
    })
    createSystemId: number

    @Column({
        nullable: true,
        name: 'updated_system',
        type: 'integer',
        width: 11,
    })
    updatedSystemId: number

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @ManyToOne(() => SystemAdmin)
    @JoinColumn({
        name: 'create_system',
    })
    creator: SystemAdmin

    @ManyToOne(() => SystemAdmin)
    @JoinColumn({
        name: 'updated_system',
    })
    updater: SystemAdmin
}
