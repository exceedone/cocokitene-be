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
import { Company } from '@entities/company.entity'
import { MeetingRoleMtg } from '@entities/meeting-role-mtg.entity'
import { UserMeeting } from '@entities/user-meeting.entity'
import { TypeRoleMeeting } from '@shares/constants'

@Entity('role_mtg')
export class RoleMtg extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'role',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    roleName: string

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description: string

    @Column({
        nullable: false,
        name: 'type',
        type: 'enum',
        enum: TypeRoleMeeting,
    })
    type: TypeRoleMeeting

    @Column({ nullable: false, name: 'company_id', type: 'integer', width: 11 })
    companyId: number

    @ManyToOne(() => Company)
    @JoinColumn({
        name: 'company_id',
    })
    company: Company

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @OneToMany(() => MeetingRoleMtg, (meetingRoleMtg) => meetingRoleMtg.roleMtg)
    meetingRoleMtg: MeetingRoleMtg[]

    @OneToMany(() => UserMeeting, (userMeeting) => userMeeting.roleMtg)
    userMeetings: UserMeeting[]
}
