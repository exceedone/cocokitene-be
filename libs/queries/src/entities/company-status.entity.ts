import { CompanyStatusEnum } from '@shares/constants/company.const'
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
@Entity('company_statuses')
export class CompanyStatus extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'status',
        type: 'enum',
        enum: CompanyStatusEnum,
        nullable: false,
    })
    status: CompanyStatusEnum

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description: string

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt: Date
}
