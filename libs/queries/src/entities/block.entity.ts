import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    BaseEntity,
} from 'typeorm'

@Entity('blocks')
export class Block extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({ nullable: false, type: 'varchar', length: 255 })
    public contract: string

    @Column({ nullable: false })
    public number: number

    @Column({
        name: 'chain_id',
        nullable: false,
        type: 'integer',
        width: 11,
    })
    chainId: number

    @CreateDateColumn({ name: 'created_at' })
    public createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    public updatedAt: Date
}
