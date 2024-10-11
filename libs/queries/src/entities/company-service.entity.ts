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
import { Plan } from './plan.entity'
import { Company } from './company.entity'
import { SystemAdmin } from './system-admin.entity'

@Entity('company_service')
export class CompanyServicePlan extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        name: 'company_id',
        type: 'integer',
        width: 7,
    })
    companyId: number

    @Column({
        nullable: false,
        name: 'plan_id',
        type: 'integer',
        width: 7,
    })
    planId: number

    @Column({
        nullable: false,
        name: 'meeting_limit',
        type: 'integer',
        width: 7,
    })
    meetingLimit: number

    @Column({
        nullable: false,
        name: 'meeting_created',
        type: 'integer',
        width: 7,
    })
    meetingCreated: number

    @Column({
        nullable: false,
        name: 'account_limit',
        type: 'integer',
        width: 7,
    })
    accountLimit: number

    @Column({
        nullable: false,
        name: 'account_created',
        type: 'integer',
        width: 7,
    })
    accountCreated: number

    @Column({
        nullable: false,
        name: 'storage_limit',
        type: 'integer',
        width: 7,
    })
    storageLimit: number

    // @Column({
    //     nullable: false,
    //     name: 'storage_used',
    //     type: 'integer',
    //     width: 7,
    // })
    // storageUsed: number

    @Column({
        nullable: false,
        name: 'storage_used',
        type: 'float',
    })
    storageUsed: number

    @Column({
        nullable: false,
        name: 'expiration_date',
        type: 'date',
    })
    expirationDate: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @Column({
        nullable: true,
        name: 'created_system',
        type: 'integer',
        width: 7,
    })
    createdSystemId: number

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @Column({
        nullable: true,
        name: 'updated_system',
        type: 'integer',
        width: 7,
    })
    updatedSystemId: number

    @ManyToOne(() => Plan)
    @JoinColumn({
        name: 'plan_id',
    })
    plan: Plan

    @ManyToOne(() => Company)
    @JoinColumn({
        name: 'company_id',
    })
    company: Company

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
