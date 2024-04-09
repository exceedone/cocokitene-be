import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { ElectionEnum } from '@shares/constants'
@Entity('elections')
export class Election extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column({
        name: 'status',
        type: 'enum',
        enum: ElectionEnum,
        nullable: false,
    })
    status: ElectionEnum

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
