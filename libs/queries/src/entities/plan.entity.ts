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
@Entity('plan_mst')
export class Plan extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: true,
        name: 'plan_name',
        type: 'varchar',
        length: 255,
        unique: true,
    })
    planName: string

    @Column({
        name: 'description',
        type: 'varchar',
        length: 1000,
        nullable: true,
    })
    description: string

    @Column({
        nullable: true,
        name: 'max_storage',
        type: 'integer',
        width: 11,
    })
    maxStorage: number

    @Column({
        nullable: true,
        name: 'max_meeting',
        type: 'integer',
        width: 11,
    })
    maxMeeting: number

    @Column({
        nullable: true,
        name: 'price',
        type: 'integer',
        width: 11,
    })
    price: number

    @Column({
        nullable: true,
        name: 'max_account_number',
        type: 'integer',
        width: 11,
    })
    maxShareholderAccount: number

    @Column({
        nullable: true,
        name: 'created_system',
        type: 'integer',
        width: 7,
    })
    createdSystemId: number

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @Column({
        nullable: true,
        name: 'updated_system',
        type: 'integer',
        width: 7,
    })
    updatedSystemId: number

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @ManyToOne(() => SystemAdmin)
    @JoinColumn({
        name: 'created_system',
    })
    creator: SystemAdmin

    @ManyToOne(() => SystemAdmin)
    @JoinColumn({
        name: 'updated_system',
    })
    updater: SystemAdmin
}
