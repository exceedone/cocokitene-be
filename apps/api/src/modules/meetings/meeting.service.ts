import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { MeetingRepository } from '@repositories/meeting.repository'

import { MeetingFileService } from '@api/modules/meeting-files/meeting-file.service'
import {
    DetailMeetingResponse,
    ProposalItemDetailMeeting,
} from '@api/modules/meetings/meeting.interface'
import { ProposalService } from '@api/modules/proposals/proposal.service'
import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { Meeting } from '@entities/meeting.entity'
import { UserMeeting } from '@entities/user-meeting.entity'
import { UserMeetingRepository } from '@repositories/user-meeting.repository'
import {
    MeetingRole,
    MeetingType,
    StatusMeeting,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { enumToArray } from '@shares/utils/enum'
import {
    AttendMeetingDto,
    CreateMeetingDto,
    GetAllMeetingDto,
    UpdateMeetingDto,
} from 'libs/queries/src/dtos/meeting.dto'
import { Pagination } from 'nestjs-typeorm-paginate'
import { VotingService } from '@api/modules/votings/voting.service'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { GetAllDto } from '@dtos/base.dto'
import { UserService } from '@api/modules/users/user.service'
import { User } from '@entities/user.entity'
import { PermissionEnum } from '@shares/constants'
import { Logger } from 'winston'

@Injectable()
export class MeetingService {
    constructor(
        private readonly meetingRepository: MeetingRepository,
        private readonly userMeetingRepository: UserMeetingRepository,
        @Inject(forwardRef(() => MeetingFileService))
        private readonly meetingFileService: MeetingFileService,
        private readonly proposalService: ProposalService,
        private readonly userMeetingService: UserMeetingService,
        @Inject(forwardRef(() => VotingService))
        private readonly votingService: VotingService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async getAllMeetings(
        getAllMeetingDto: GetAllMeetingDto,
        user: User,
        companyId: number,
    ): Promise<Pagination<Meeting>> {
        const listMeetingsResponse =
            await this.meetingRepository.getInternalListMeeting(
                companyId,
                getAllMeetingDto,
            )
        const idsMeeting = listMeetingsResponse.map((meeting) => meeting.id)
        await Promise.all([
            ...idsMeeting.map((id) => this.standardStatusMeeting(id)),
        ])
        const userId = user.id
        const permissionKeys: string[] = (user as any).permissionKeys || []
        const canUserCreateMeeting = permissionKeys.includes(
            PermissionEnum.CREATE_MEETING,
        )

        const meetings = await this.meetingRepository.getAllMeetings(
            companyId,
            userId,
            canUserCreateMeeting,
            getAllMeetingDto,
        )
        return meetings
    }

    async attendanceMeeting(
        attendMeetingDto: AttendMeetingDto,
        userId: number,
        companyId: number,
    ): Promise<string> {
        const { meetingId } = attendMeetingDto
        let userMeetings: UserMeeting[]
        try {
            userMeetings = await this.userMeetingRepository.find({
                where: {
                    userId: userId,
                    meetingId: meetingId,
                },
            })
            if (!userMeetings) {
                throw new HttpException(
                    httpErrors.USER_MEETING_NOT_FOUND,
                    HttpStatus.NOT_FOUND,
                )
            }

            const existedMeeting =
                await this.meetingRepository.getMeetingByMeetingIdAndCompanyId(
                    meetingId,
                    companyId,
                )
            if (!existedMeeting) {
                throw new HttpException(
                    httpErrors.MEETING_NOT_EXISTED,
                    HttpStatus.BAD_REQUEST,
                )
            }
            const currentDate = new Date()
            const startTimeMeeting = new Date(existedMeeting.startTime)
            const endTimeMeeting = new Date(existedMeeting.endTime)

            if (existedMeeting.status == StatusMeeting.CANCELED) {
                throw new HttpException(
                    httpErrors.MEETING_HAS_CANCELED,
                    HttpStatus.BAD_REQUEST,
                )
            } else if (existedMeeting.status == StatusMeeting.DELAYED) {
                throw new HttpException(
                    httpErrors.MEETING_HAS_DELAYED,
                    HttpStatus.BAD_REQUEST,
                )
            } else if (currentDate < startTimeMeeting) {
                throw new HttpException(
                    httpErrors.MEETING_NOT_START,
                    HttpStatus.BAD_REQUEST,
                )
            } else if (
                currentDate >= startTimeMeeting &&
                currentDate < endTimeMeeting
            ) {
                await Promise.all([
                    ...userMeetings.map((userMeeting) =>
                        this.userMeetingService.saveStatusUserMeeting(
                            userMeeting,
                        ),
                    ),
                ])
            }
            return 'You have successfully joined the meeting!!!'
        } catch (error) {
            throw new HttpException(
                {
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            )
        }
    }

    async createMeeting(
        createMeetingDto: CreateMeetingDto,
        creatorId: number,
        companyId: number,
    ) {
        // create meeting
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

        // create project
        let createdMeeting: Meeting,
            typeMeeting: MeetingType.SHAREHOLDER_MEETING
        try {
            createdMeeting = await this.meetingRepository.createMeeting(
                createMeetingDto,
                typeMeeting,
                creatorId,
                companyId,
            )
            this.logger.info(
                `${messageLog.CREATE_SHAREHOLDER_MEETING_SUCCESS.message} ${createdMeeting.id}`,
            )
        } catch (error) {
            this.logger.error(
                `${messageLog.CREATE_SHAREHOLDER_MEETING_FAILED.code} ${messageLog.CREATE_SHAREHOLDER_MEETING_FAILED.message}`,
            )
            throw new HttpException(
                httpErrors.MEETING_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        const {
            meetingMinutes,
            meetingInvitations,
            resolutions,
            amendmentResolutions,
            hosts,
            controlBoards,
            directors,
            administrativeCouncils,
            shareholders,
        } = createMeetingDto

        const totalShares =
            await this.userService.getTotalSharesHolderByShareholderIds(
                shareholders,
            )

        try {
            await Promise.all([
                ...meetingMinutes.map((file) =>
                    this.meetingFileService.createMeetingFile({
                        url: file.url,
                        meetingId: createdMeeting.id,
                        fileType: file.fileType,
                    }),
                ),
                ...meetingInvitations.map((invitation) =>
                    this.meetingFileService.createMeetingFile({
                        url: invitation.url,
                        meetingId: createdMeeting.id,
                        fileType: invitation.fileType,
                    }),
                ),
                ...resolutions.map((resolution) =>
                    this.proposalService.createProposal({
                        title: resolution.title,
                        description: resolution.description,
                        oldDescription: resolution.oldDescription,
                        files: resolution.files,
                        type: resolution.type,
                        meetingId: createdMeeting.id,
                        creatorId: creatorId,
                        notVoteYetQuantity: totalShares,
                    }),
                ),
                ...amendmentResolutions.map((amendmentResolution) =>
                    this.proposalService.createProposal({
                        title: amendmentResolution.title,
                        description: amendmentResolution.description,
                        oldDescription: amendmentResolution.oldDescription,
                        files: amendmentResolution.files,
                        type: amendmentResolution.type,
                        meetingId: createdMeeting.id,
                        creatorId: creatorId,
                        notVoteYetQuantity: totalShares,
                    }),
                ),
                ...hosts.map((host) =>
                    this.userMeetingService.createUserMeeting({
                        userId: host,
                        meetingId: createdMeeting.id,
                        role: MeetingRole.HOST,
                    }),
                ),
                ...controlBoards.map((controlBoard) =>
                    this.userMeetingService.createUserMeeting({
                        userId: controlBoard,
                        meetingId: createdMeeting.id,
                        role: MeetingRole.CONTROL_BOARD,
                    }),
                ),
                ...directors.map((director) =>
                    this.userMeetingService.createUserMeeting({
                        userId: director,
                        meetingId: createdMeeting.id,
                        role: MeetingRole.DIRECTOR,
                    }),
                ),
                ...administrativeCouncils.map((administrativeCouncil) =>
                    this.userMeetingService.createUserMeeting({
                        userId: administrativeCouncil,
                        meetingId: createdMeeting.id,
                        role: MeetingRole.ADMINISTRATIVE_COUNCIL,
                    }),
                ),
                ...shareholders.map((shareholder) =>
                    this.userMeetingService.createUserMeeting({
                        userId: shareholder,
                        meetingId: createdMeeting.id,
                        role: MeetingRole.SHAREHOLDER,
                    }),
                ),
            ])
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        return createdMeeting
    }

    async getMeetingById(
        meetingId: number,
        companyId: number,
        userId: number,
    ): Promise<DetailMeetingResponse> {
        const meeting = await this.meetingRepository.getMeetingByIdAndCompanyId(
            meetingId,
            companyId,
        )
        if (!meeting) {
            // this.logger.error('[DAPP] Meeting not existed. Please try again')
            throw new HttpException(
                httpErrors.MEETING_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        // this.logger.info(
        //     '[DAPP] Get meeting successfully by meetingId: ' + meeting.id,
        // )

        const [
            hosts,
            controlBoards,
            directors,
            administrativeCouncils,
            shareholders,
        ] = await Promise.all(
            enumToArray(MeetingRole).map((role) =>
                this.userMeetingService.getUserMeetingByMeetingIdAndRole(
                    meetingId,
                    role,
                ),
            ),
        )

        const shareholdersTotal = shareholders.length
        const shareholdersJoined = shareholders.reduce(
            (accumulator, currentValue) => {
                accumulator =
                    currentValue.status === UserMeetingStatusEnum.PARTICIPATE
                        ? accumulator + 1
                        : accumulator
                return accumulator
            },
            0,
        )
        const totalMeetingShares = shareholders.reduce(
            (accumulator, currentValue) => {
                accumulator += Number(currentValue.user.shareQuantity)
                return accumulator
            },
            0,
        )

        const joinedMeetingShares = shareholders.reduce(
            (accumulator, currentValue) => {
                accumulator =
                    currentValue.status === UserMeetingStatusEnum.PARTICIPATE
                        ? accumulator + Number(currentValue.user.shareQuantity)
                        : accumulator
                return accumulator
            },
            0,
        )

        // handle vote result with current user
        const listProposals: ProposalItemDetailMeeting[] = []
        for (const proposal of meeting.proposals) {
            const existedVoting =
                await this.votingService.findVotingByUserIdAndProposalId(
                    userId,
                    proposal.id,
                )
            if (
                !existedVoting ||
                existedVoting.result === VoteProposalResult.NO_IDEA
            ) {
                listProposals.push({
                    ...proposal,
                    voteResult: VoteProposalResult.NO_IDEA,
                } as ProposalItemDetailMeeting)
            } else if (existedVoting.result === VoteProposalResult.VOTE) {
                listProposals.push({
                    ...proposal,
                    voteResult: VoteProposalResult.VOTE,
                } as ProposalItemDetailMeeting)
            } else {
                listProposals.push({
                    ...proposal,
                    voteResult: VoteProposalResult.UNVOTE,
                } as ProposalItemDetailMeeting)
            }
        }

        return {
            ...meeting,
            hosts,
            controlBoards,
            directors,
            administrativeCouncils,
            shareholders,
            shareholdersTotal,
            shareholdersJoined,
            joinedMeetingShares,
            totalMeetingShares,
            proposals: listProposals,
        }
    }

    async getInternalMeetingById(meetingId: number): Promise<Meeting> {
        const meeting = await this.meetingRepository.getInternalMeetingById(
            meetingId,
        )
        return meeting
    }

    async updateMeeting(
        meetingId: number,
        updateMeetingDto: UpdateMeetingDto,
        userId: number,
        companyId: number,
    ) {
        if (!userId) {
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
        let existedMeeting = await this.getMeetingByMeetingIdAndCompanyId(
            meetingId,
            companyId,
        )
        if (!existedMeeting) {
            throw new HttpException(
                httpErrors.MEETING_NOT_EXISTED,
                HttpStatus.BAD_REQUEST,
            )
        }
        // update meeting
        try {
            existedMeeting = await this.meetingRepository.updateMeeting(
                meetingId,
                updateMeetingDto,
                userId,
                companyId,
            )
            this.logger.info(
                `${messageLog.UPDATE_SHAREHOLDER_MEETING_SUCCESS.message} ${existedMeeting.id}`,
            )
        } catch (error) {
            this.logger.error(
                `${messageLog.UPDATE_SHAREHOLDER_MEETING_FAILED.code} ${messageLog.UPDATE_SHAREHOLDER_MEETING_FAILED.message} ${existedMeeting.id}`,
            )
            throw new HttpException(
                httpErrors.MEETING_UPDATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        const {
            meetingMinutes,
            meetingInvitations,
            resolutions,
            amendmentResolutions,
            hosts,
            controlBoards,
            directors,
            administrativeCouncils,
            shareholders,
        } = updateMeetingDto

        const totalShares =
            await this.userService.getTotalSharesHolderByShareholderIds(
                shareholders,
            )
        const listMeetingFiles = [...meetingMinutes, ...meetingInvitations]
        const listProposals = [...resolutions, ...amendmentResolutions]

        await Promise.all([
            this.meetingFileService.updateListMeetingFiles(
                meetingId,
                listMeetingFiles,
            ),
            this.proposalService.updateListProposals(
                meetingId,
                userId,
                listProposals,
                totalShares,
                shareholders,
            ),
            await Promise.all([
                this.userMeetingService.updateUserMeeting(
                    meetingId,
                    MeetingRole.HOST,
                    hosts,
                ),
                this.userMeetingService.updateUserMeeting(
                    meetingId,
                    MeetingRole.CONTROL_BOARD,
                    controlBoards,
                ),
                this.userMeetingService.updateUserMeeting(
                    meetingId,
                    MeetingRole.DIRECTOR,
                    directors,
                ),
                this.userMeetingService.updateUserMeeting(
                    meetingId,
                    MeetingRole.ADMINISTRATIVE_COUNCIL,
                    administrativeCouncils,
                ),
                this.userMeetingService.updateUserMeeting(
                    meetingId,
                    MeetingRole.SHAREHOLDER,
                    shareholders,
                ),
            ]),
        ])
        return existedMeeting
    }
    async getAllMeetingParticipant(meetingId: number, filter: GetAllDto) {
        return this.userMeetingRepository.getAllParticipantInMeeting(
            meetingId,
            filter.searchQuery,
        )
    }

    async standardStatusMeeting(meetingId: number): Promise<Meeting> {
        const existedMeeting =
            await this.meetingRepository.getInternalMeetingById(meetingId)
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

    async getMeetingByMeetingIdAndCompanyId(
        meetingId: number,
        companyId: number,
    ): Promise<Meeting> {
        const meeting =
            await this.meetingRepository.getMeetingByMeetingIdAndCompanyId(
                meetingId,
                companyId,
            )
        return meeting
    }
}
