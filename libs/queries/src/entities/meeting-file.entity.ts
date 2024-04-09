import { Meeting } from '@entities/meeting.entity'
import { FileTypes } from '@shares/constants/meeting.const'
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
@Entity('meeting_files')
export class MeetingFile extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, name: 'url', type: 'varchar', length: 255 })
    url: string

    @Column({ nullable: false, name: 'meeting_id', type: 'integer', width: 11 })
    meetingId: number

    @Column({
        nullable: true,
        type: 'enum',
        name: 'file_type',
        enum: FileTypes,
    })
    fileType: FileTypes

    @DeleteDateColumn()
    deletedAt: Date

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

    @ManyToOne(() => Meeting, (meeting) => meeting.meetingFiles)
    @JoinColumn({ name: 'meeting_id' })
    meeting: Meeting
}
