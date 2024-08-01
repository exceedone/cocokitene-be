import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Election } from './election.entity'
import { Meeting } from './meeting.entity'
import { User } from './user.entity'
import { Candidate } from './nominees.entity'

@Entity('personnel_voting')
export class PersonnelVoting extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'title',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    title: string

    @Column({
        nullable: false,
        name: 'type',
        type: 'integer',
        width: 11,
    })
    type: number

    @Column({ nullable: false, name: 'meeting_id', type: 'integer', width: 11 })
    meetingId: number

    @ManyToOne(() => Election)
    @JoinColumn({
        name: 'type',
    })
    typeElection: Election

    @ManyToOne(() => Meeting)
    @JoinColumn({
        name: 'meeting_id',
    })
    meeting: Meeting

    @OneToMany(() => Candidate, (candidate) => candidate.personnelVoting)
    candidate: Candidate[]

    @Column({
        nullable: false,
        name: 'created_user',
        type: 'integer',
        width: 11,
    })
    creatorId: number

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'created_user',
    })
    creator: User

    @Column({
        nullable: true,
        name: 'updated_user',
        type: 'integer',
        width: 11,
    })
    updateId?: number

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'updated_user',
    })
    updaterId: User

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date
}
