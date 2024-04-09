import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Meeting } from '@entities/meeting.entity'
import { MeetingFile } from '@entities/meeting-file.entity'

@Entity('file_meeting_transactions')
export class FileMeetingTransaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        name: 'meeting_file_id',
        type: 'integer',
        width: 11,
    })
    meetingFileId: number

    @Column({
        nullable: false,
        name: 'meeting_id',
        type: 'integer',
        width: 11,
    })
    meetingId: number

    @Column({ nullable: false, name: 'url', type: 'varchar', length: 255 })
    url: string

    @ManyToOne(() => Meeting)
    @JoinColumn({
        name: 'meeting_id',
    })
    meeting: Meeting

    @OneToOne(() => MeetingFile)
    @JoinColumn({
        name: 'meeting_file_id',
    })
    meetingFile: MeetingFile

    @DeleteDateColumn()
    deletedAt: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
