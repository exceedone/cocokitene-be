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
    calculateVoter,
    CandidateItemDetailMeeting,
    DetailMeetingResponse,
    ListFileOfMeeting,
    ParticipantMeeting,
    personnelVotingDetailMeeting,
    ProposalItemDetailMeeting,
} from '@api/modules/meetings/meeting.interface'
import { ProposalService } from '@api/modules/proposals/proposal.service'
import { UserMeetingService } from '@api/modules/user-meetings/user-meeting.service'
import { Meeting } from '@entities/meeting.entity'
import { UserMeeting } from '@entities/meeting-participant.entity'
import { UserMeetingRepository } from '@repositories/meeting-participant.repository'
import {
    MeetingHash,
    MeetingType,
    StatusMeeting,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { httpErrors, messageLog } from '@shares/exception-filter'
import {
    AttendMeetingDto,
    CreateMeetingDto,
    GetAllMeetingDto,
    GetAllMeetingInDayDto,
    StatisticMeetingInMonthDto,
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
    RoleBoardMtgEnum,
    RoleMtgEnum,
} from '@shares/constants'
import { Logger } from 'winston'
import { MeetingRoleMtgService } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.service'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'
import { ChatPermissionService } from '@api/modules/chat-permission/chat-permission.service'
import { CandidateRepository } from '@repositories/nominees.repository'
import { ProposalRepository } from '@repositories/meeting-proposal.repository'
import { VotingCandidateService } from '../voting-candidate/voting-candidate.service'
import { hashMd5 } from '@shares/utils/md5'
import { dateTimeToEpochTime } from '@shares/utils'
import { PersonnelVotingService } from '../personnel-voting/personnel-voting.service'

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

        private readonly candidateRepository: CandidateRepository,
        private readonly proposalRepository: ProposalRepository,
        @Inject(forwardRef(() => VotingCandidateService))
        private readonly votingCandidateService: VotingCandidateService,
        private readonly personnelVotingService: PersonnelVotingService,
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
            personnelVoting,
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

                ...personnelVoting.map((personnelVote) =>
                    this.personnelVotingService.createPersonnelVoting(
                        {
                            title: personnelVote.title,
                            type: personnelVote.type,
                            meetingId: createdMeeting.id,
                            creatorId: creatorId,
                            candidate: personnelVote.candidate,
                        },
                        totalShares,
                    ),
                ),

                ...participants.map(async (item) => {
                    await Promise.all([
                        ...item.userIds.map(async (userId) => {
                            if (
                                item.roleName.toLocaleUpperCase() ===
                                RoleMtgEnum.SHAREHOLDER.toLocaleUpperCase()
                            ) {
                                const quantityOfShareholder =
                                    await this.userService.getQuantityShareByShareholderId(
                                        userId,
                                    )

                                await this.userMeetingService.createUserMeeting(
                                    {
                                        userId: userId,
                                        meetingId: createdMeeting.id,
                                        roleMtgId: item.roleMtgId,
                                        quantityShare: quantityOfShareholder,
                                    },
                                )
                            } else {
                                await this.userMeetingService.createUserMeeting(
                                    {
                                        userId: userId,
                                        meetingId: createdMeeting.id,
                                        roleMtgId: item.roleMtgId,
                                    },
                                )
                            }
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
        user: User,
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
        if (meeting.type !== MeetingType.SHAREHOLDER_MEETING) {
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
                    userShareQuantity: userMeeting.quantityShare,
                }
            })

            return {
                roleMtgId: roleMtg.id,
                roleMtgName: roleMtg.roleName,
                userParticipants: userParticipants,
            }
        })

        const permissionKeys: string[] = (user as any).permissionKeys || []
        const canUserCreateMeeting = permissionKeys.includes(
            PermissionEnum.CREATE_MEETING,
        )

        const participants = await Promise.all(participantsPromises)

        const isParticipant = participants
            .flatMap((participant) => participant.userParticipants)
            .some((parti) => parti.userId == userId)

        if (!isParticipant && !canUserCreateMeeting) {
            throw new HttpException(
                httpErrors.MEETING_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

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

        //Handle Voting Candidate result with current User
        const listPersonnelVoting: personnelVotingDetailMeeting[] = []
        for (const personnelVoting of meeting.personnelVoting) {
            const listCandidate: CandidateItemDetailMeeting[] = []
            for (const candidate of personnelVoting.candidate) {
                const existedVotingCandidate =
                    await this.votingCandidateService.findVotingByUserIdAndCandidateId(
                        userId,
                        candidate.id,
                    )

                if (
                    !existedVotingCandidate ||
                    existedVotingCandidate.result === VoteProposalResult.NO_IDEA
                ) {
                    listCandidate.push({
                        ...candidate,
                        voteResult: VoteProposalResult.NO_IDEA,
                        votedQuantityShare: null,
                    } as CandidateItemDetailMeeting)
                } else if (
                    existedVotingCandidate.result === VoteProposalResult.VOTE
                ) {
                    listCandidate.push({
                        ...candidate,
                        voteResult: VoteProposalResult.VOTE,
                        votedQuantityShare:
                            existedVotingCandidate.quantityShare,
                    } as CandidateItemDetailMeeting)
                } else {
                    listCandidate.push({
                        ...candidate,
                        voteResult: VoteProposalResult.UNVOTE,
                        votedQuantityShare:
                            existedVotingCandidate.quantityShare,
                    } as CandidateItemDetailMeeting)
                }
            }
            listPersonnelVoting.push({
                ...personnelVoting,
                candidate: listCandidate,
            })
        }

        return {
            ...meeting,
            participants,
            shareholdersTotal,
            shareholdersJoined,
            joinedMeetingShares,
            totalMeetingShares,
            proposals: listProposals,
            personnelVoting: listPersonnelVoting,
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
        if (
            existedMeeting.status == StatusMeeting.CANCELED ||
            existedMeeting.status == StatusMeeting.HAPPENED
        ) {
            throw new HttpException(
                httpErrors.MEETING_UPDATE_FAILED,
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
            personnelVoting,
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

        const participantShareholderIdCurrent =
            await this.userMeetingRepository.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
                meetingId,
                roleMtgShareholderId,
            )

        const shareholderIdOld: number[] = []
        const shareholderIdNew: number[] = []

        shareholders.forEach((shareholder) => {
            if (participantShareholderIdCurrent.includes(shareholder)) {
                shareholderIdOld.push(shareholder)
            } else {
                shareholderIdNew.push(shareholder)
            }
        })

        const totalShareOld =
            await this.userMeetingService.getTotalQuantityShareByParticipantId(
                meetingId,
                shareholderIdOld,
                roleMtgShareholderId,
            )

        const totalShareAdd =
            await this.userService.getTotalSharesHolderByShareholderIds(
                shareholderIdNew,
            )

        const totalShares: number = totalShareOld + totalShareAdd

        //Get Shareholder(Active) out meeting
        const usersToRemoves = (
            await this.userMeetingService.getListUserToRemoveInMeeting(
                meetingId,
                shareholders,
                roleMtgShareholderId,
            )
        ).map((participant) => participant.id)

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

            this.personnelVotingService.updateListPersonnelVoting(
                companyId,
                meetingId,
                userId,
                personnelVoting,
                usersToRemoves,
                totalShares,
            ),

            await Promise.all([
                ...participants.map((item) =>
                    this.userMeetingService.updateUserMeeting(
                        meetingId,
                        item.roleMtgId,
                        item.userIds,
                        roleMtgShareholderId,
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

    async changePermissionChatInMeeting(
        userId: number,
        meetingId: number,
        companyId: number,
        permissionChatId: number,
    ) {
        //Check use is host of meeting
        const roleMtgHost =
            await this.roleMtgService.getRoleMtgByNameAndCompanyId(
                RoleMtgEnum.HOST,
                companyId,
            )

        const listUserIdIsHost =
            await this.userMeetingService.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
                meetingId,
                roleMtgHost.id,
            )

        if (!listUserIdIsHost.some((hostId) => hostId == userId)) {
            throw new HttpException(
                httpErrors.CHANGE_PERMISSION_CHAT_FAILED,
                HttpStatus.BAD_REQUEST,
            )
        }
        //Change permission of meeting

        const meeting =
            await this.meetingRepository.getMeetingByMeetingIdAndCompanyId(
                meetingId,
                companyId,
            )
        if (!meeting) {
            throw new HttpException(
                httpErrors.MEETING_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        meeting.chatPermissionId = permissionChatId
        await meeting.save()

        return meeting.chatPermissionId
    }

    async getDataHashByMeetingId(meetingId: number, companyId: number) {
        //Meeting file
        const meeting = await this.getMeetingByMeetingIdAndCompanyId(
            meetingId,
            companyId,
        )

        const meetingFiles =
            await this.meetingFileService.getMeetingFilesByMeetingId(meetingId)
        const listMeetingFile: ListFileOfMeeting[] = meetingFiles.map(
            (meetingFile) => {
                return {
                    meetingId: meetingFile.meetingId,
                    meetingFileId: meetingFile.id,
                    url: meetingFile.url,
                    type: meetingFile.fileType,
                    createAt: meetingFile.createdAt,
                    deletedAt: meetingFile.deletedAt,
                }
            },
        )

        const listMeetingProposals =
            await this.proposalRepository.getAllProposalByMtgId(meetingId)
        const listMeetingCandidates =
            await this.candidateRepository.getAllCandidateByMeetingId(meetingId)

        const listVoteProposals = []
        const listVoteCandidate = []

        await Promise.all([
            ...listMeetingProposals.map(async (proposal) => {
                const listVoteOfProposal =
                    await this.votingService.getAllVotingByProposalId(
                        proposal.id,
                    )
                listVoteOfProposal.map((vote) => {
                    listVoteProposals.push(vote)
                })
            }),
            ...listMeetingCandidates.map(async (candidate) => {
                const listVoteOfCandidate =
                    await this.votingCandidateService.getAllVotingByCandidateId(
                        candidate.id,
                    )
                listVoteOfCandidate.map((voteCandidate) => {
                    listVoteCandidate.push(voteCandidate)
                })
            }),
        ])

        const listParticipantOfMeeting =
            await this.userMeetingRepository.getAllIdsParticipantInBoardMeeting(
                meetingId,
            )

        listMeetingFile.sort((a, b) => a.meetingFileId - b.meetingFileId)
        listMeetingProposals.sort((a, b) => a.id - b.id)
        listVoteProposals.sort((a, b) => a.id - b.id)
        listMeetingCandidates.sort((a, b) => a.id - b.id)
        listVoteCandidate.sort((a, b) => a.id - b.id)
        listParticipantOfMeeting.sort((a, b) => a.id - b.id)

        const voteInformation = await this.calculateVoter(
            meeting.id,
            companyId,
            meeting.type,
        )

        const hash_basicMeeting = hashMd5(
            JSON.stringify({
                meetingId: meeting.id,
                companyId: companyId,
                titleMeeting: meeting.title,
                meetingLink: meeting.meetingLink,
                startTimeMeeting: dateTimeToEpochTime(meeting.startTime),
                endTimeMeeting: dateTimeToEpochTime(meeting.endTime),
                endVotingTime: dateTimeToEpochTime(meeting.endVotingTime),
                status: meeting.status,
                voterTotal: voteInformation.voterTotal,
                voterJoined: voteInformation.voterJoined,
                totalMeetingVote: voteInformation.totalMeetingVote,
                joinedMeetingVote: voteInformation.joinedMeetingVote,
            }),
        )

        const hash_fileMeeting = hashMd5(JSON.stringify(listMeetingFile))
        const hash_proposalMeeting = hashMd5(
            JSON.stringify(listMeetingProposals),
        )
        const hash_proposalVote = hashMd5(JSON.stringify(listVoteProposals))
        const hash_candidateMeeting = hashMd5(
            JSON.stringify(listMeetingCandidates),
        )
        const hash_candidateVote = hashMd5(JSON.stringify(listVoteCandidate))
        const hash_participantMeeting = hashMd5(
            JSON.stringify(listParticipantOfMeeting),
        )
        const hash_detailMeeting = hashMd5(
            JSON.stringify({
                meetingId: meeting.id,
                companyId: companyId,
                titleMeeting: meeting.title,
                meetingLink: meeting.meetingLink,
                startTimeMeeting: dateTimeToEpochTime(meeting.startTime),
                endTimeMeeting: dateTimeToEpochTime(meeting.endTime),
                endVotingTime: dateTimeToEpochTime(meeting.endVotingTime),
                status: meeting.status,
                voterTotal: voteInformation.voterTotal,
                voterJoined: voteInformation.voterJoined,
                totalMeetingVote: voteInformation.totalMeetingVote,
                joinedMeetingVote: voteInformation.joinedMeetingVote,
                fileMeeting: listMeetingFile,
                proposalMeeting: listMeetingProposals,
                proposalVote: listVoteProposals,
                candidateMeeting: listMeetingCandidates,
                candidateVote: listVoteCandidate,
                participantMeeting: listParticipantOfMeeting,
            }),
        )

        return {
            id: meeting.id,
            [MeetingHash.HASH_MEETING_BASE]: hash_basicMeeting,
            [MeetingHash.HASH_MEETING_FILE]: hash_fileMeeting,
            [MeetingHash.HASH_MEETING_PROPOSAL]: hash_proposalMeeting,
            [MeetingHash.HASH_MEETING_VOTED_PROPOSAL]: hash_proposalVote,
            [MeetingHash.HASH_MEETING_CANDIDATE]: hash_candidateMeeting,
            [MeetingHash.HASH_MEETING_VOTED_CANDIDATE]: hash_candidateVote,
            [MeetingHash.HASH_MEETING_PARTICIPANT]: hash_participantMeeting,
            [MeetingHash.HASH_DETAIL_MEETING]: hash_detailMeeting,
        }
    }

    async calculateVoter(
        meetingId: number,
        companyId: number,
        meetingType: MeetingType,
    ): Promise<calculateVoter> {
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

        let voterTotal: number,
            voterJoined: number,
            totalMeetingVote: number,
            joinedMeetingVote: number

        if (meetingType === MeetingType.SHAREHOLDER_MEETING) {
            const roleMtgShareholderId =
                await this.roleMtgService.getRoleMtgByNameAndCompanyId(
                    RoleMtgEnum.SHAREHOLDER,
                    companyId,
                )
            const shareholders = participants.find(
                (item) => item.roleMtgId === roleMtgShareholderId?.id,
            )
            if (!shareholders) {
                voterTotal = 0
                voterJoined = 0
                totalMeetingVote = 0
                joinedMeetingVote = 0
            } else {
                voterTotal = shareholders.userParticipants.length

                voterJoined = shareholders.userParticipants.reduce(
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

                totalMeetingVote = shareholders.userParticipants.reduce(
                    (accumulator, currentValue) => {
                        if (currentValue.userShareQuantity) {
                            accumulator += Number(
                                currentValue.userShareQuantity,
                            )
                        }
                        return accumulator
                    },
                    0,
                )

                joinedMeetingVote = shareholders.userParticipants.reduce(
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
        }
        if (meetingType === MeetingType.BOARD_MEETING) {
            const idOfHostRoleInMtg = meetingRoleMtgs
                .map((item) => item.roleMtg)
                .filter(
                    (role) =>
                        role.roleName.toLocaleUpperCase() ===
                        RoleBoardMtgEnum.HOST.toLocaleUpperCase(),
                )

            const participantBoard = participants
                .filter((item) => item.roleMtgId !== idOfHostRoleInMtg[0]?.id)
                .map((item) => item.userParticipants)
                .flat()

            const participantBoardId = participantBoard.map(
                (participant) => participant.userId,
            )

            const cachedObject = {}
            const uniqueParticipants = participantBoard.filter((obj) => {
                if (!cachedObject[obj.userId]) {
                    cachedObject[obj.userId] = true
                    return true
                }
                return false
            })

            voterTotal = new Set(participantBoardId).size
            if (!voterTotal) {
                voterTotal = 0
                totalMeetingVote = 0
            } else {
                voterJoined = uniqueParticipants.reduce((total, current) => {
                    total =
                        current.status === UserMeetingStatusEnum.PARTICIPATE
                            ? total + 1
                            : total
                    return total
                }, 0)
                joinedMeetingVote = voterJoined
                totalMeetingVote = voterTotal
            }
        }
        return {
            voterTotal: voterTotal,
            voterJoined: voterJoined,
            totalMeetingVote: totalMeetingVote,
            joinedMeetingVote: joinedMeetingVote,
        }
    }

    async getAllMeetingsInDay(
        getAllMeetingInDayDto: GetAllMeetingInDayDto,
        user: User,
        companyId: number,
        canUserCreateMeeting: boolean,
    ): Promise<Pagination<Meeting>> {
        const userId = user.id
        try {
            const listMeetings =
                await this.meetingRepository.getAllMeetingsInDay(
                    companyId,
                    userId,
                    canUserCreateMeeting,
                    getAllMeetingInDayDto,
                )

            const meetingIds = listMeetings.items.map(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                (meeting) => meeting.meetings_id,
            )

            if (listMeetings.items.length) {
                await Promise.all([
                    ...meetingIds.map((meetingId) =>
                        this.standardStatusMeeting(meetingId),
                    ),
                ])
            }

            const meetings = await this.meetingRepository.getAllMeetingsInDay(
                companyId,
                userId,
                canUserCreateMeeting,
                getAllMeetingInDayDto,
            )

            return meetings
        } catch (error) {
            console.log('Error: ', error)
        }
    }

    async getMeetingInMonth(
        statisticMeetingInMonthDto: StatisticMeetingInMonthDto,
        user: User,
        type: MeetingType,
    ): Promise<Meeting[]> {
        try {
            const companyId = user.companyId
            const meetings = await this.meetingRepository.getMeetingInMonth(
                companyId,
                type,
                statisticMeetingInMonthDto,
            )

            return meetings
        } catch (error) {
            console.log('error-----:', error)
        }
    }
}
