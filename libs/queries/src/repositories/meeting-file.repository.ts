import { MeetingFile } from '@entities/meeting-file.entity'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { CreateMeetingFileDto, MeetingFileDto } from '../dtos'

@CustomRepository(MeetingFile)
export class MeetingFileRepository extends Repository<MeetingFile> {
    async createMeetingFile(
        createMeetingFileDto: CreateMeetingFileDto,
    ): Promise<MeetingFile> {
        const { url, meetingId, fileType } = createMeetingFileDto
        const createdMeetingFile = await this.create({
            url,
            meetingId,
            fileType,
        })
        await createdMeetingFile.save()
        return createdMeetingFile
    }

    async getMeetingFileById(meetingFileId: number): Promise<MeetingFile> {
        const meetingFile = await this.findOne({
            where: {
                id: meetingFileId,
            },
            relations: ['meeting'],
        })
        return meetingFile
    }

    async updateMeetingFile(
        meetingFileId: number,
        meetingFileDto: MeetingFileDto,
    ): Promise<MeetingFile> {
        await this.createQueryBuilder('meeting_files')
            .update(MeetingFile)
            .set({
                url: meetingFileDto.url,
                fileType: meetingFileDto.fileType,
            })
            .where('meeting_files.id = :meetingFileId', { meetingFileId })
            .execute()
        const meetingFile = await this.findOne({
            where: {
                id: meetingFileId,
            },
        })
        return meetingFile
    }

    async deleteMeetingFile(meetingFileId: number): Promise<void> {
        await this.delete(meetingFileId)
    }

    async getMeetingFilesByMeetingId(
        meetingId: number,
    ): Promise<MeetingFile[]> {
        const meetingFile = await this.find({
            where: {
                meetingId: meetingId,
            },
        })
        return meetingFile
    }
}
