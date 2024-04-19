import { CreateBoardMeetingDto } from './../../../../../libs/queries/src/dtos/board-meeting.dto'
import { Meeting } from '@entities/meeting.entity'
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common'
import { MeetingRepository } from '@repositories/meeting.repository'
import { MeetingType, StatusMeeting } from '@shares/constants/meeting.const'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { Logger } from 'winston'
import { MeetingFileService } from '../meeting-files/meeting-file.service'
import { ProposalService } from '../proposals/proposal.service'
import { UserMeetingService } from '../user-meetings/user-meeting.service'
import { CandidateService } from '../candidate/candidate.service'
import { Pagination } from 'nestjs-typeorm-paginate'
import { GetAllMeetingDto } from '@dtos/meeting.dto'
import { User } from '@entities/user.entity'
import { PermissionEnum, RoleMtgEnum } from '@shares/constants'
import { MeetingRoleMtgService } from '../meeting-role-mtgs/meeting-role-mtg.service'

@Injectable()
export class BoardMeetingService {
    constructor(
        private readonly boardMeetingRepository: MeetingRepository,

        @Inject(forwardRef(() => MeetingFileService))
        private readonly meetingFileService: MeetingFileService,
        private readonly proposalService: ProposalService,
        private readonly userMeetingService: UserMeetingService,
        private readonly candidateService: CandidateService,
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async getAllBoardMeeting(
        getAllBoardMeetingDto: GetAllMeetingDto,
        user: User,
        companyId: number,
    ): Promise<Pagination<Meeting>> {
        const listBoardMeetingResponse =
            await this.boardMeetingRepository.getInternalListMeeting(
                companyId,
                getAllBoardMeetingDto,
            )

        const idOfMeetings = listBoardMeetingResponse.map(
            (meeting) => meeting.id,
        )

        await Promise.all([
            ...idOfMeetings.map((id) => this.standardStatusMeeting(id)),
        ])
        const userId = user.id
        const permissionKeys: string[] = (user as any).permissionKeys || []
        const canUserCreateBoardMeeting = permissionKeys.includes(
            PermissionEnum.CREATE_BOARD_MEETING,
        )

        const boardMeetings = await this.boardMeetingRepository.getAllMeetings(
            companyId,
            userId,
            canUserCreateBoardMeeting,
            getAllBoardMeetingDto,
        )

        return boardMeetings
    }

    async createBoardMeeting(
        createBoardMeetingDto: CreateBoardMeetingDto,
        creatorId: number,
        companyId: number,
    ) {
        if (!creatorId) {
            throw new HttpException(
                httpErrors.USER_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
            )
        }

        if (!companyId) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
            )
        }

        //create
        let createdBoardMeeting: Meeting
        const typeMeeting = MeetingType.BOARD_MEETING

        try {
            createdBoardMeeting =
                await this.boardMeetingRepository.createBoardMeeting(
                    createBoardMeetingDto,
                    typeMeeting,
                    creatorId,
                    companyId,
                )
            this.logger.info(
                `${messageLog.CREATE_BOARD_MEETING_SUCCESS.message} ${createdBoardMeeting.id}`,
            )
        } catch (error) {
            this.logger.error(
                `${messageLog.CREATE_BOARD_MEETING_FAILED.code} ${messageLog.CREATE_BOARD_MEETING_FAILED.message}`,
            )

            throw new HttpException(
                httpErrors.BOARD_MEETING_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        const {
            meetingMinutes,
            meetingInvitations,
            managementAndFinancials,
            elections,
            candidates,
            participants,
        } = createBoardMeetingDto

        const userIdParticipants = participants
            .filter((participant) => participant.roleName !== RoleMtgEnum.HOST)
            .map((participant) => participant.userIds)
            .flat()

        const totalVoter = new Set(userIdParticipants).size
        const roleBoardMtg = participants.map((item) => item.roleMtgId)

        try {
            await Promise.all([
                ...meetingMinutes.map((file) =>
                    this.meetingFileService.createMeetingFile({
                        url: file.url,
                        meetingId: createdBoardMeeting.id,
                        fileType: file.fileType,
                    }),
                ),
                ...meetingInvitations.map((invitation) =>
                    this.meetingFileService.createMeetingFile({
                        url: invitation.url,
                        meetingId: createdBoardMeeting.id,
                        fileType: invitation.fileType,
                    }),
                ),
                ...managementAndFinancials.map((report) =>
                    this.proposalService.createProposal({
                        title: report.title,
                        description: report.description,
                        oldDescription: report.oldDescription,
                        files: report.files,
                        type: report.type,
                        meetingId: createdBoardMeeting.id,
                        creatorId: creatorId,
                        notVoteYetQuantity: totalVoter,
                    }),
                ),
                ...elections.map((election) =>
                    this.proposalService.createProposal({
                        title: election.title,
                        description: election.description,
                        oldDescription: election.oldDescription,
                        files: election.files,
                        type: election.type,
                        meetingId: createdBoardMeeting.id,
                        creatorId: creatorId,
                        notVoteYetQuantity: totalVoter,
                    }),
                ),
                ...candidates.map((candidate) =>
                    this.candidateService.createCandidate({
                        title: candidate.title,
                        candidateName: candidate.candidateName,
                        type: candidate.type,
                        meetingId: createdBoardMeeting.id,
                        creatorId: creatorId,
                        notVoteYetQuantity: totalVoter,
                    }),
                ),
                ...participants.map(async (item) => {
                    await Promise.all([
                        ...item.userIds.map(async (userId) => {
                            await this.userMeetingService.createUserMeeting({
                                userId: userId,
                                meetingId: createdBoardMeeting.id,
                                roleMtgId: item.roleMtgId,
                            })
                        }),
                    ])
                }),

                ...roleBoardMtg.map((roleMtgId) =>
                    this.meetingRoleMtgService.createMeetingRoleMtg({
                        meetingId: createdBoardMeeting.id,
                        roleMtgId: roleMtgId,
                    }),
                ),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        return createdBoardMeeting
    }

    async standardStatusMeeting(meetingId: number): Promise<Meeting> {
        const existedMeeting =
            await this.boardMeetingRepository.getInternalMeetingById(meetingId)
        if (!existedMeeting) {
            throw new HttpException(
                httpErrors.MEETING_NOT_EXISTED,
                HttpStatus.BAD_REQUEST,
            )
        }
        if (
            existedMeeting.status === StatusMeeting.DELAYED ||
            existedMeeting.status === StatusMeeting.CANCELED
        ) {
            return existedMeeting
        }
        const currenDate = new Date()
        const startTimeMeeting = new Date(existedMeeting.startTime)
        const endTimeMeeting = new Date(existedMeeting.endTime)
        if (currenDate < startTimeMeeting) {
            existedMeeting.status = StatusMeeting.NOT_HAPPEN
        } else if (
            currenDate >= startTimeMeeting &&
            currenDate <= endTimeMeeting
        ) {
            existedMeeting.status = StatusMeeting.HAPPENING
        } else if (currenDate > endTimeMeeting) {
            existedMeeting.status = StatusMeeting.HAPPENED
        }
        await existedMeeting.save()
        return existedMeeting
    }
}
