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
import { User } from '@entities/user.entity'
import { PersonnelVoting } from './personnel-voting.entity'
import { VotingCandidate } from './voted-for-nominee.entity'

@Entity('nominees')
export class Candidate extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        name: 'name',
        type: 'varchar',
        length: 255,
    })
    candidateName: string

    @Column({
        nullable: false,
        name: 'personnel_voting_id',
        type: 'integer',
        width: 11,
    })
    personnelVotingId: number

    @Column({
        nullable: true,
        name: 'voted_quantity',
        type: 'integer',
        width: 11,
    })
    votedQuantity: number

    @Column({
        nullable: true,
        name: 'un_voted_quantity',
        type: 'integer',
        width: 11,
    })
    unVotedQuantity: number

    @Column({
        nullable: true,
        name: 'not_vote_yet_quantity',
        type: 'integer',
        width: 11,
    })
    notVoteYetQuantity: number

    @ManyToOne(
        () => PersonnelVoting,
        (personnelVoting) => personnelVoting.candidate,
    )
    @JoinColumn({
        name: 'personnel_voting_id',
    })
    personnelVoting: PersonnelVoting

    @Column({
        nullable: false,
        name: 'creator_user',
        type: 'integer',
        width: 11,
    })
    creatorId: number

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'creator_user',
    })
    creator: User

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @OneToMany(
        () => VotingCandidate,
        (votingCandidate) => votingCandidate.votedForCandidate,
    )
    votedForCandidate: VotingCandidate[]
}
