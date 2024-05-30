/* eslint-disable @typescript-eslint/no-unused-vars */

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
    ParticipantMeeting,
    ProposalItemDetailMeeting,
} from '@api/modules/meetings/meeting.interface'
import { ProposalService } from '@api/modules/proposals/proposal.service'
import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { Meeting } from '@entities/meeting.entity'
import { UserMeeting } from '@entities/user-meeting.entity'
import { UserMeetingRepository } from '@repositories/user-meeting.repository'
import {
    MeetingType,
    StatusMeeting,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { httpErrors, messageLog } from '@shares/exception-filter'
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
import {
    ChatPermissionEnum,
    PermissionEnum,
    RoleMtgEnum,
} from '@shares/constants'
import { Logger } from 'winston'
import { MeetingRoleMtgService } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.service'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'
import { ChatPermissionService } from '@api/modules/chat-permission/chat-permission.service'

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
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
        private readonly roleMtgService: RoleMtgService,
        private readonly chatPermissionService: ChatPermissionService,
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
        // when create a meeting, chat mode fault is every public private
        const chatPermissionEveryPublicPrivate =
            await this.chatPermissionService.getChatPermissionByName(
                ChatPermissionEnum.EVERY_PUBLIC_PRIVATE,
            )
        createdMeeting.chatPermissionId = chatPermissionEveryPublicPrivate.id
        await createdMeeting.save()
        const {
            meetingMinutes,
            meetingInvitations,
            resolutions,
            amendmentResolutions,
            participants,
        } = createMeetingDto
        const shareholders = participants
            .filter(
                (participant) =>
                    participant.roleName.toLocaleUpperCase() ===
                    RoleMtgEnum.SHAREHOLDER.toLocaleUpperCase(),
            )
            .map((participant) => participant.userIds)
            .flat()

        const roleMtgInMtgs = participants.map((item) => item.roleMtgId)
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

                ...participants.map(async (item) => {
                    await Promise.all([
                        ...item.userIds.map(async (userId) => {
                            await this.userMeetingService.createUserMeeting({
                                userId: userId,
                                meetingId: createdMeeting.id,
                                roleMtgId: item.roleMtgId,
                            })
                        }),
                    ])
                }),

                ...roleMtgInMtgs.map((item) =>
                    this.meetingRoleMtgService.createMeetingRoleMtg({
                        meetingId: createdMeeting.id,
                        roleMtgId: item,
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
            throw new HttpException(
                httpErrors.MEETING_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const meetingRoleMtgs =
            await this.meetingRoleMtgService.getMeetingRoleMtgByMeetingId(
                meetingId,
            )

        const roleMtgs = meetingRoleMtgs
            .map((item) => item.roleMtg)
            .sort((a, b) => a.roleName.localeCompare(b.roleName))

        const participantsPromises = roleMtgs.map(async (roleMtg) => {
            const userMeetings =
                await this.userMeetingService.getUserMeetingByMeetingIdAndRole(
                    meetingId,
                    roleMtg.id,
                )

            const userParticipants = userMeetings.map((userMeeting) => {
                return {
                    userDefaultAvatarHashColor:
                        userMeeting.user.defaultAvatarHashColor,
                    userId: userMeeting.user.id,
                    userAvatar: userMeeting.user.avatar,
                    userEmail: userMeeting.user.email,
                    status: userMeeting.status,
                    userJoined:
                        userMeeting.status ===
                        UserMeetingStatusEnum.PARTICIPATE,
                    userShareQuantity: userMeeting.user.shareQuantity,
                }
            })

            return {
                roleMtgId: roleMtg.id,
                roleMtgName: roleMtg.roleName,
                userParticipants: userParticipants,
            }
        })

        const participants = await Promise.all(participantsPromises)

        const roleMtgShareholderId =
            await this.roleMtgService.getRoleMtgByNameAndCompanyId(
                RoleMtgEnum.SHAREHOLDER,
                companyId,
            )

        const shareholders = participants.find(
            (item) => item.roleMtgId === roleMtgShareholderId.id,
        )

        let shareholdersTotal
        let shareholdersJoined
        let totalMeetingShares
        let joinedMeetingShares

        if (!shareholders) {
            shareholdersTotal = 0
            shareholdersJoined = 0
            totalMeetingShares = 0
            joinedMeetingShares = 0
        } else {
            shareholdersTotal = shareholders.userParticipants.length

            shareholdersJoined = shareholders.userParticipants.reduce(
                (accumulator, currentValue) => {
                    accumulator =
                        currentValue.status ===
                        UserMeetingStatusEnum.PARTICIPATE
                            ? accumulator + 1
                            : accumulator
                    return accumulator
                },
                0,
            )

            totalMeetingShares = shareholders.userParticipants.reduce(
                (accumulator, currentValue) => {
                    if (currentValue.userShareQuantity) {
                        accumulator += Number(currentValue.userShareQuantity)
                    }
                    return accumulator
                },
                0,
            )

            joinedMeetingShares = shareholders.userParticipants.reduce(
                (accumulator, currentValue) => {
                    if (currentValue.userShareQuantity) {
                        accumulator =
                            currentValue.status ===
                            UserMeetingStatusEnum.PARTICIPATE
                                ? accumulator +
                                  Number(currentValue.userShareQuantity)
                                : accumulator
                    }
                    return accumulator
                },
                0,
            )
        }

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
            participants,
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
            participants,
        } = updateMeetingDto

        const shareholders = participants
            .filter(
                (participant) =>
                    participant.roleName.toUpperCase() ===
                    RoleMtgEnum.SHAREHOLDER,
            )
            .map((participant) => participant.userIds)
            .flat()

        const roleMtgShareholderId = participants
            .filter(
                (participant) =>
                    participant.roleName.toUpperCase() ===
                    RoleMtgEnum.SHAREHOLDER,
            )
            .map((participant) => participant.roleMtgId)
            .find((id) => true)

        const totalShares =
            await this.userService.getTotalSharesHolderByShareholderIds(
                shareholders,
            )

        const listMeetingFiles = [...meetingMinutes, ...meetingInvitations]
        const listProposals = [...resolutions, ...amendmentResolutions]
        const roleMtgInMtgs = participants.map((item) => item.roleMtgId)

        const exitedRoleInMtg = (
            await this.meetingRoleMtgService.getMeetingRoleMtgByMeetingId(
                meetingId,
            )
        ).map((item) => item.roleMtgId)

        const listMtgRoleAdded = roleMtgInMtgs.filter(
            (item) => !exitedRoleInMtg.includes(item),
        )

        await Promise.all([
            this.meetingFileService.updateListMeetingFiles(
                meetingId,
                listMeetingFiles,
            ),
            this.proposalService.updateListProposals(
                meetingId,
                companyId,
                userId,
                listProposals,
                totalShares,
                shareholders,
                roleMtgShareholderId,
            ),

            await Promise.all([
                ...participants.map((item) =>
                    this.userMeetingService.updateUserMeeting(
                        meetingId,
                        item.roleMtgId,
                        item.userIds,
                    ),
                ),

                ...listMtgRoleAdded.map((item) =>
                    this.meetingRoleMtgService.createMeetingRoleMtg({
                        meetingId: meetingId,
                        roleMtgId: item,
                    }),
                ),
            ]),
        ])
        return existedMeeting
    }
    async getAllMeetingParticipant(meetingId: number, filter: GetAllDto) {
        const meetingRoleMtgs =
            await this.meetingRoleMtgService.getMeetingRoleMtgByMeetingId(
                meetingId,
            )

        const roleMtgs = meetingRoleMtgs
            .map((item) => item.roleMtg)
            .sort((a, b) => a.roleName.localeCompare(b.roleName))
        const userMeetings =
            await this.userMeetingRepository.getAllParticipantInMeeting(
                meetingId,
                filter.searchQuery,
            )
        const participantPromises = roleMtgs.map(async (roleMtg) => {
            const userParticipants = []
            userMeetings.forEach((userMeeting) => {
                if (userMeeting.roleMtgId === roleMtg.id) {
                    const participantItemResponse = {
                        defaultAvatarHashColor:
                            userMeeting.user.defaultAvatarHashColor,
                        avatar: userMeeting.user.avatar,
                        email: userMeeting.user.email,
                        status: userMeeting.status,
                        joined:
                            userMeeting.status ===
                            UserMeetingStatusEnum.PARTICIPATE,
                        shareQuantity: userMeeting.user.shareQuantity,
                    }
                    if (participantItemResponse !== null) {
                        userParticipants.push(participantItemResponse)
                    }
                }
            })

            return {
                roleMtgId: roleMtg.id,
                roleMtgName: roleMtg.roleName,
                userParticipants: userParticipants,
            }
        })
        const participantResults = await Promise.all(participantPromises)
        const participantMeeting: ParticipantMeeting = {
            userWithRoleMtg: participantResults,
        }
        return participantMeeting
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

    async getAllParticipantInviteMeeting(meetingId: number): Promise<any> {
        const participants =
            await this.userMeetingService.getAllParticipantInviteMeeting(
                meetingId,
            )
        return participants
    }
}
