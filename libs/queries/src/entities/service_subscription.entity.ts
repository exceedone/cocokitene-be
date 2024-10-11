import {
    PaymentMethod,
    StatusSubscription,
    SubscriptionEnum,
} from '@shares/constants'
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

@Entity('service_subscription')
export class ServiceSubscription extends BaseEntity {
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
        nullable: true,
        name: 'note',
        type: 'varchar',
        length: 5000,
    })
    note: string

    @Column({
        nullable: false,
        name: 'type',
        type: 'enum',
        enum: SubscriptionEnum,
    })
    type: SubscriptionEnum

    @Column({
        nullable: false,
        name: 'total_free',
        type: 'integer',
        width: 11,
    })
    amount: number

    @Column({
        nullable: false,
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod

    @Column({
        nullable: false,
        name: 'activation_date',
        type: 'date',
    })
    activationDate: Date

    @Column({
        nullable: false,
        name: 'expiration_date',
        type: 'date',
    })
    expirationDate: Date

    @Column({
        nullable: false,
        name: 'status',
        type: 'enum',
        enum: StatusSubscription,
        default: StatusSubscription.PENDING,
    })
    status: StatusSubscription

    @Column({
        type: 'datetime',
        nullable: true,
        name: 'approval_time',
    })
    approvalTime: Date

    // @Column({
    //     nullable: false,
    //     name: 'resolve_flag',
    //     type: 'enum',
    //     enum: FlagResolve,
    //     default: FlagResolve.PENDING,
    // })
    // resolveFlag: FlagResolve

    // @Column({
    //     nullable: true,
    //     name: 'transfer_receipt',
    //     type: 'text',
    // })
    // transferReceipt: string

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
}
