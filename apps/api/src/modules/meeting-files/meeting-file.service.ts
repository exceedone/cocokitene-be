import { CreateMeetingFileDto, MeetingFileDto } from '@dtos/meeting-file.dto'
import { MeetingFile } from '@entities/meeting-file.entity'
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common'
import { MeetingFileRepository } from '@repositories/meeting-file.repository'
import { httpErrors } from '@shares/exception-filter'
import { MeetingService } from '@api/modules/meetings/meeting.service'
import { FileTypes } from '@shares/constants/meeting.const'

@Injectable()
export class MeetingFileService {
    constructor(
        private readonly meetingFileRepository: MeetingFileRepository,
        @Inject(forwardRef(() => MeetingService))
        private readonly meetingService: MeetingService,
    ) {}

    async createMeetingFile(
        createMeetingFileDto: CreateMeetingFileDto,
    ): Promise<MeetingFile> {
        const { url, meetingId, fileType } = createMeetingFileDto
        try {
            const createdMeetingFile =
                await this.meetingFileRepository.createMeetingFile({
                    url,
                    meetingId,
                    fileType,
                })
            await createdMeetingFile.save()
            return createdMeetingFile
        } catch (error) {
            throw new HttpException(
                httpErrors.MEETING_FILE_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async deleteMeetingFile(
        userId: number,
        companyId: number,
        meetingFileId: number,
    ) {
        // check existed of meeting and meetingFile

        const meetingFile = await this.meetingFileRepository.getMeetingFileById(
            meetingFileId,
        )

        if (!meetingFile) {
            throw new HttpException(
                httpErrors.MEETING_FILE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        if (meetingFile.meeting.companyId !== companyId) {
            throw new HttpException(
                httpErrors.MEETING_NOT_IN_THIS_COMPANY,
                HttpStatus.BAD_REQUEST,
            )
        }
        try {
            //delete meeting-file
            const meetingId = meetingFile.meeting.id
            await this.meetingFileRepository.softDelete({
                meetingId,
                id: meetingFileId,
            })
            return `meeting-file with Id ${meetingFileId} deleted successfully`
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async updateListMeetingFiles(
        meetingId: number,
        meetingFiles: MeetingFileDto[],
    ): Promise<void> {
        const meeting = await this.meetingService.getInternalMeetingById(
            meetingId,
        )
        const listCurrentMeetingFiles = meeting.meetingFiles
        // list edited
        const listEdited = meetingFiles.filter((file) => !!file.id)
        const listEditedIds = listEdited.map((file) => file.id)
        // list deleted
        const listDeleted = listCurrentMeetingFiles.filter(
            (file) => !listEditedIds.includes(file.id),
        )
        // list added
        const listAdded = meetingFiles.filter((file) => !file.id)

        try {
            await Promise.all([
                ...listEdited.map((file) =>
                    this.meetingFileRepository.updateMeetingFile(file.id, file),
                ),
                ...listDeleted.map((file) =>
                    this.meetingFileRepository.deleteMeetingFile(file.id),
                ),
                ...listAdded.map((file) =>
                    this.meetingFileRepository.createMeetingFile({
                        ...file,
                        meetingId,
                    }),
                ),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.BAD_REQUEST,
            )
        }
    }
    async getMeetingFilesByMeetingId(
        meetingId: number,
    ): Promise<MeetingFile[]> {
        const meetingFiles = await this.meetingFileRepository.find({
            where: {
                meetingId: meetingId,
            },
        })
        return meetingFiles
    }
    async getMeetingFilesByMeetingIdAndType(
        meetingId: number,
        fileType: FileTypes,
    ): Promise<MeetingFile[]> {
        const meetingFiles = await this.meetingFileRepository.find({
            where: {
                meetingId: meetingId,
                fileType: fileType,
            },
        })
        return meetingFiles
    }
}
