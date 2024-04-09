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
import { CompanyStatus } from './company-status.entity'
import { Plan } from './plan.entity'
import { Role } from './role.entity'

@Entity('companys')
export class Company extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        name: 'company_name',
        type: 'varchar',
        length: 255,
    })
    companyName: string

    @Column({
        nullable: true,
        name: 'company_short_name',
        type: 'varchar',
        length: 255,
    })
    companyShortName: string

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description: string

    @Column({
        nullable: false,
        name: 'company_address',
        type: 'varchar',
        length: 255,
    })
    address: string

    @Column({ nullable: false, name: 'plan_id', type: 'integer', width: 11 })
    planId: number

    @Column({ nullable: false, name: 'status_id', type: 'integer', width: 11 })
    statusId: number

    @Column({
        nullable: false,
        name: 'representative_user',
        type: 'varchar',
        length: 255,
    })
    representativeUser: string

    @Column({
        nullable: false,
        name: 'company_phone',
        type: 'varchar',
        length: 255,
    })
    phone: string

    @Column({
        nullable: false,
        name: 'company_tax_number',
        type: 'varchar',
        length: 255,
        unique: true,
    })
    taxNumber: string

    @Column({
        name: 'company_email',
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true,
    })
    email: string

    @Column({
        name: 'company_fax',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    fax: string

    @Column({
        name: 'date_of_corporation',
        type: 'date',
        nullable: false,
    })
    dateOfCorporation: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @Column({
        nullable: true,
        name: 'company_logo',
        type: 'varchar',
        length: 255,
    })
    logo: string

    @Column({
        nullable: true,
        type: 'varchar',
        length: 255,
        name: 'business_type',
    })
    businessType: string

    @ManyToOne(() => CompanyStatus)
    @JoinColumn({
        name: 'status_id',
    })
    companyStatus: CompanyStatus

    @ManyToOne(() => Plan)
    @JoinColumn({
        name: 'plan_id',
    })
    plan: Plan

    @OneToMany(() => Role, (role) => role.company)
    role: Role[]
}
