import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { UserStatusEnum } from '@shares/constants'

@Entity('user_statuses')
export class UserStatus extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'status',
        type: 'enum',
        enum: UserStatusEnum,
        nullable: false,
    })
    status: UserStatusEnum

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
