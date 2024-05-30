import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
@Entity('system_admins_mst')
export class SystemAdmin extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'username',
        type: 'varchar',
        length: 255,
        nullable: true,
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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
