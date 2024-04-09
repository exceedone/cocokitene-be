import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
@Entity('plans')
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
        length: 255,
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
        name: 'max_shareholder_account',
        type: 'integer',
        width: 11,
    })
    maxShareholderAccount: number
}
