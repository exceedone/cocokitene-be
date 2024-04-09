import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { PermissionEnum } from '@shares/constants/permission.const'
import { RolePermission } from './role-permission.entity'

@Entity('permissions')
export class Permission extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'status',
        type: 'enum',
        enum: PermissionEnum,
        nullable: false,
    })
    key: PermissionEnum

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @OneToMany(
        () => RolePermission,
        (rolePermission) => rolePermission.permission,
    )
    rolePermissions: RolePermission[]
}
