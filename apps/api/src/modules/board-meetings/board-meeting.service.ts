import { GetAllMeetingDto } from '@dtos/meeting.dto'
import { Meeting } from '@entities/meeting.entity'
import { User } from '@entities/user.entity'
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common'
import { MeetingRepository } from '@repositories/meeting.repository'
import {
    ChatPermissionEnum,
    PermissionEnum,
    RoleBoardMtgEnum,
} from '@shares/constants'
import {
    MeetingType,
    StatusMeeting,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { VoteProposalResult } from '@shares/constants/proposal.const'
import { httpErrors, messageLog } from '@shares/exception-filter'
import {
    CreateBoardMeetingDto,
    UpdateBoardMeetingDto,
} from 'libs/queries/src/dtos/board-meeting.dto'
import { Pagination } from 'nestjs-typeorm-paginate'
import { Logger } from 'winston'
import { CandidateService } from '../candidate/candidate.service'
import { MeetingFileService } from '../meeting-files/meeting-file.service'
import { MeetingRoleMtgService } from '../meeting-role-mtgs/meeting-role-mtg.service'
import { ProposalItemDetailMeeting } from '../meetings/meeting.interface'
import { ProposalService } from '../proposals/proposal.service'
import { UserMeetingService } from '../user-meetings/user-meeting.service'
import { VotingCandidateService } from '../voting-candidate/voting-candidate.service'
import { VotingService } from '../votings/voting.service'
import {
    CandidateItemDetailMeeting,
    DetailBoardMeetingResponse,
} from './board-meeting.interface'
import { ChatPermissionService } from '../chat-permission/chat-permission.service'

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
        private readonly votingService: VotingService,
        private readonly votingCandidateService: VotingCandidateService,
        private readonly chatPermissionService: ChatPermissionService,

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

        //Seed permission of chat for meeting is chat Public and Private
        const chatPermissionEveryPublicPrivate =
            await this.chatPermissionService.getChatPermissionByName(
                ChatPermissionEnum.EVERY_PUBLIC_PRIVATE,
            )

        createdBoardMeeting.chatPermissionId =
            chatPermissionEveryPublicPrivate.id
        await createdBoardMeeting.save()

        const {
            meetingMinutes,
            meetingInvitations,
            managementAndFinancials,
            elections,
            candidates,
            participants,
        } = createBoardMeetingDto

        const userIdParticipants = participants
            .filter(
                (participant) => participant.roleName !== RoleBoardMtgEnum.HOST,
            )
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

    async getBoardMeetingById(
        meetingId: number,
        companyId: number,
        userId: number,
        user: User,
    ): Promise<DetailBoardMeetingResponse> {
        const boardMeeting =
            await this.boardMeetingRepository.getBoardMeetingByIdAndCompanyId(
                meetingId,
                companyId,
            )

        if (!boardMeeting || boardMeeting.type !== MeetingType.BOARD_MEETING) {
            throw new HttpException(
                httpErrors.BOARD_MEETING_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const listRoleBoardMtg =
            await this.meetingRoleMtgService.getMeetingRoleMtgByMeetingId(
                meetingId,
            )

        const roleBoardMtg = listRoleBoardMtg
            .map((item) => item.roleMtg)
            .sort((a, b) => a.roleName.localeCompare(b.roleName))

        const participantsPromises = roleBoardMtg.map(async (roleBoard) => {
            const participantBoardMeeting =
                await this.userMeetingService.getUserMeetingByMeetingIdAndRole(
                    meetingId,
                    roleBoard.id,
                )

            const participantOfRole = participantBoardMeeting.map(
                (participant) => {
                    return {
                        userDefaultAvatarHashColor:
                            participant.user.defaultAvatarHashColor,
                        userId: participant.user.id,
                        userAvatar: participant.user.avatar,
                        userEmail: participant.user.email,
                        status: participant.status,
                        userJoined:
                            participant.status ===
                            UserMeetingStatusEnum.PARTICIPATE,
                        userShareQuantity: participant.user.shareQuantity,
                    }
                },
            )

            return {
                roleMtgId: roleBoard.id,
                roleMtgName: roleBoard.roleName,
                userParticipants: participantOfRole,
            }
        })

        const participants = await Promise.all(participantsPromises)

        const permissionKeys: string[] = (user as any).permissionKeys || []
        const canUserCreateBoardMeeting = permissionKeys.includes(
            PermissionEnum.CREATE_BOARD_MEETING,
        )

        const isParticipant = participants
            .flatMap((participant) => participant.userParticipants)
            .some((parti) => parti.userId == userId)
        console.log('canUserCreateMeeting: ', canUserCreateBoardMeeting)
        console.log('Is Participants: ', isParticipant)

        if (!isParticipant && !canUserCreateBoardMeeting) {
            throw new HttpException(
                httpErrors.BOARD_MEETING_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        const idOfHostRoleInMtg = listRoleBoardMtg
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
        const uniqueParticipantBoard = participantBoard.filter((obj) => {
            if (!cachedObject[obj.userId]) {
                cachedObject[obj.userId] = true
                return true
            }
            return false
        })

        const boardTotal = new Set(participantBoardId).size
        let boardJoinedTotal
        if (!boardTotal) {
            boardJoinedTotal = 0
        } else {
            boardJoinedTotal = uniqueParticipantBoard.reduce(
                (total, current) => {
                    total =
                        current.status === UserMeetingStatusEnum.PARTICIPATE
                            ? total + 1
                            : total
                    return total
                },
                0,
            )
        }

        // handle vote proposal result with current user
        const listProposals: ProposalItemDetailMeeting[] = []
        for (const proposal of boardMeeting.proposals) {
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

        // handle vote candidate result with current user
        const listCandidate: CandidateItemDetailMeeting[] = []
        for (const candidate of boardMeeting.candidates) {
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
                } as CandidateItemDetailMeeting)
            } else if (
                existedVotingCandidate.result === VoteProposalResult.VOTE
            ) {
                listCandidate.push({
                    ...candidate,
                    voteResult: VoteProposalResult.VOTE,
                } as CandidateItemDetailMeeting)
            } else {
                listCandidate.push({
                    ...candidate,
                    voteResult: VoteProposalResult.UNVOTE,
                } as CandidateItemDetailMeeting)
            }
        }

        return {
            ...boardMeeting,
            participants,
            boardsTotal: boardTotal,
            boardsJoined: boardJoinedTotal,
            proposals: listProposals,
            candidates: listCandidate,
        }
    }

    async updateBoardMeeting(
        userId: number,
        companyId: number,
        meetingId: number,
        updateBoardMeetingDto: UpdateBoardMeetingDto,
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
                HttpStatus.BAD_GATEWAY,
            )
        }
        let existedBoardMeeting =
            await this.getBoardMeetingByMeetingIdAndCompanyId(
                meetingId,
                companyId,
            )
        if (
            !existedBoardMeeting ||
            existedBoardMeeting.type !== MeetingType.BOARD_MEETING
        ) {
            throw new HttpException(
                httpErrors.MEETING_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
            )
        }

        if (
            existedBoardMeeting.status == StatusMeeting.CANCELED ||
            existedBoardMeeting.status == StatusMeeting.HAPPENED
        ) {
            throw new HttpException(
                httpErrors.MEETING_UPDATE_FAILED,
                HttpStatus.BAD_REQUEST,
            )
        }

        //Update board Meeting
        try {
            existedBoardMeeting =
                await this.boardMeetingRepository.updateMeeting(
                    meetingId,
                    updateBoardMeetingDto,
                    userId,
                    companyId,
                )
            this.logger.info(
                `${messageLog.UPDATE_BOARD_MEETING_SUCCESS.message} ${existedBoardMeeting.id}`,
            )
        } catch (error) {
            this.logger.error(
                `${messageLog.UPDATE_BOARD_MEETING_FAILED.code} ${messageLog.UPDATE_SHAREHOLDER_MEETING_FAILED.message} ${existedBoardMeeting.id}`,
            )
            throw new HttpException(
                httpErrors.MEETING_UPDATE_FAILED,
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
        } = updateBoardMeetingDto

        const userIdParticipants = participants
            .filter(
                (participant) =>
                    participant.roleName.toLocaleUpperCase() !==
                    RoleBoardMtgEnum.HOST.toLocaleUpperCase(),
            )
            .map((participant) => participant.userIds)
            .flat()

        const uniqueBoardIdParticipants = Array.from(
            new Set(userIdParticipants),
        )

        const totalVoter = new Set(userIdParticipants).size
        const roleBoardMtg = participants.map((item) => item.roleMtgId)

        const listBoardMeetingFile = [...meetingMinutes, ...meetingInvitations]
        const listProposals = [...managementAndFinancials, ...elections]

        const exitedRoleInMtg = (
            await this.meetingRoleMtgService.getMeetingRoleMtgByMeetingId(
                meetingId,
            )
        ).map((item) => item.roleMtgId)

        const listMtgRoleAdded = roleBoardMtg.filter(
            (item) => !exitedRoleInMtg.includes(item),
        )

        const boardIdActiveRemoveMeeting =
            await this.userMeetingService.getListActiveBoardIdRemoveBoardMtg(
                existedBoardMeeting.id,
                uniqueBoardIdParticipants,
            )
        await Promise.all([
            this.meetingFileService.updateListMeetingFiles(
                meetingId,
                listBoardMeetingFile,
            ),

            this.proposalService.updateListProposalBoardMtg(
                meetingId,
                userId,
                listProposals,
                boardIdActiveRemoveMeeting,
                totalVoter,
            ),

            this.candidateService.updateListCandidateBoardMtg(
                companyId,
                meetingId,
                userId,
                candidates,
                boardIdActiveRemoveMeeting,
                totalVoter,
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

        return existedBoardMeeting
    }

    async getBoardMeetingByMeetingIdAndCompanyId(
        meetingId: number,
        companyId: number,
    ): Promise<Meeting> {
        const meeting =
            await this.boardMeetingRepository.getMeetingByMeetingIdAndCompanyId(
                meetingId,
                companyId,
            )
        return meeting
    }
}
