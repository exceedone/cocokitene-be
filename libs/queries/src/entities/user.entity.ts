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
import { UserStatus } from '@entities/user-status.entity'
import { Company } from '@entities/company.entity'
import { UserRole } from '@entities/user-role.entity'
import { Reaction } from '@entities/reaction-messages.entity'

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'username',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    username: string

    @Column({
        name: 'email',
        type: 'varchar',
        length: 255,
        nullable: true,
        unique: true,
    })
    email: string

    @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
    password: string

    @Column({
        name: 'reset_password_token',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    resetPasswordToken: string

    @Column({
        nullable: true,
        name: 'reset_password_expire_time',
    })
    resetPasswordExpireTime: Date

    @Column({
        name: 'wallet_address',
        type: 'varchar',
        length: 255,
        nullable: true,
        unique: true,
    })
    walletAddress: string

    @Column({ name: 'avartar', type: 'varchar', length: 255, nullable: true })
    avatar: string

    @Column({ nullable: false, name: 'status_id', type: 'integer', width: 11 })
    statusId: number

    @Column({ nullable: false, name: 'company_id', type: 'integer', width: 11 })
    companyId: number

    @Column({
        nullable: true,
        name: 'share_quantity',
        type: 'integer',
        width: 11,
    })
    shareQuantity: number

    @Column({
        nullable: true,
        type: 'varchar',
        length: 50,
    })
    nonce: string

    @Column({
        nullable: true,
        type: 'varchar',
        length: 255,
    })
    defaultAvatarHashColor: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @ManyToOne(() => UserStatus)
    @JoinColumn({
        name: 'status_id',
    })
    userStatus: UserStatus

    @ManyToOne(() => Company)
    @JoinColumn({
        name: 'company_id',
    })
    company: Company

    @Column({
        nullable: true,
        name: 'phone_number',
        type: 'varchar',
        length: 255,
    })
    phone: string

    @Column({
        nullable: true,
        name: 'active_time',
    })
    activeTime: Date

    @OneToMany(() => UserRole, (userRole) => userRole.user)
    userRole: UserRole[]

    @OneToMany(() => Reaction, (reaction) => reaction.user)
    reactions: Reaction[]
}
