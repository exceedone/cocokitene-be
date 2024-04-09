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
import { User } from '@entities/user.entity'
import { Role } from '@entities/role.entity'

@Entity('user_roles')
export class UserRole extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'user_id', type: 'integer', width: 11 })
    userId: number

    @Column({ nullable: false, name: 'role_id', type: 'integer', width: 11 })
    roleId: number

    @ManyToOne(() => User, (user) => user.userRole)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ManyToOne(() => Role, (role) => role.userRole)
    @JoinColumn({
        name: 'role_id',
    })
    role: Role

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
