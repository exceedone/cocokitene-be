import { CreateUserMeetingDto } from '@dtos/user-meeting.dto'
import { UserMeeting } from '@entities/meeting-participant.entity'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { UserMeetingRepository } from '@repositories/meeting-participant.repository'
import { UserMeetingStatusEnum } from '@shares/constants/meeting.const'
import { httpErrors } from '@shares/exception-filter'
import { UserService } from '@api/modules/users/user.service'
import { Logger } from 'winston'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'
import { MeetingRoleMtgService } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.service'
import { RoleBoardMtgEnum } from '@shares/constants'
@Injectable()
export class UserMeetingService {
    constructor(
        private readonly userMeetingRepository: UserMeetingRepository,
        // private readonly userService: UserService,
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly roleMtgService: RoleMtgService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async createUserMeeting(
        createUserMeetingDto: CreateUserMeetingDto,
    ): Promise<UserMeeting> {
        const { userId, meetingId, roleMtgId, status, quantityShare } =
            createUserMeetingDto
        try {
            const createdUserMeeting =
                await this.userMeetingRepository.createUserMeeting({
                    userId,
                    meetingId,
                    roleMtgId,
                    status,
                    quantityShare,
                })
            // return await createdUserMeeting.save()
            return createdUserMeeting
        } catch (error) {
            this.logger.error('User meeting failed. Please try again')
            throw new HttpException(
                {
                    code: httpErrors.USER_MEETING_CREATE_FAILED.code,
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getUserMeetingByMeetingIdAndRole(
        meetingId: number,
        roleMtgId: number,
    ): Promise<UserMeeting[]> {
        const userMeetings =
            await this.userMeetingRepository.getUserMeetingByMeetingIdAndRole(
                meetingId,
                roleMtgId,
            )

        return userMeetings
    }
    async updateUserMeeting(
        meetingId: number,
        roleMtgId: number,
        newIdPaticipants: number[],
        roleMtgShareholderId?: number,
    ): Promise<number[]> {
        const listUserIds =
            await this.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
                meetingId,
                roleMtgId,
            )

        // ids just add from dto
        const usersToAdds = newIdPaticipants.filter(
            (userId) => !listUserIds.includes(userId),
        )

        const addedUsersFollowRole: number[] = []
        addedUsersFollowRole.push(...usersToAdds)

        //ids need to delete when it not appear in newIdPaticipant
        const usersToRemoves = listUserIds.filter(
            (userId) => !newIdPaticipants.includes(userId),
        )

        await Promise.all([
            ...usersToRemoves.map((usersToRemove) =>
                this.userMeetingRepository.removeUserFromMeeting(
                    usersToRemove,
                    meetingId,
                    roleMtgId,
                ),
            ),
            ...usersToAdds.map(async (usersToAdd) => {
                const isUserParticipateMeeting =
                    await this.getUserMeetingByUserIdAndMeetingIdAndStatus(
                        usersToAdd,
                        meetingId,
                        UserMeetingStatusEnum.PARTICIPATE,
                    )
                if (isUserParticipateMeeting) {
                    if (roleMtgId === roleMtgShareholderId) {
                        const quantityOfShareholder =
                            await this.userService.getQuantityShareByShareholderId(
                                usersToAdd,
                            )
                        await this.createUserMeeting({
                            userId: usersToAdd,
                            meetingId: meetingId,
                            roleMtgId: roleMtgId,
                            quantityShare: quantityOfShareholder,
                            status: UserMeetingStatusEnum.PARTICIPATE,
                        })
                    } else {
                        await this.createUserMeeting({
                            userId: usersToAdd,
                            meetingId: meetingId,
                            roleMtgId: roleMtgId,
                            status: UserMeetingStatusEnum.PARTICIPATE,
                        })
                    }
                } else {
                    if (roleMtgId === roleMtgShareholderId) {
                        const quantityOfShareholder =
                            await this.userService.getQuantityShareByShareholderId(
                                usersToAdd,
                            )
                        await this.createUserMeeting({
                            userId: usersToAdd,
                            meetingId: meetingId,
                            roleMtgId: roleMtgId,
                            quantityShare: quantityOfShareholder,
                        })
                    } else {
                        await this.createUserMeeting({
                            userId: usersToAdd,
                            meetingId: meetingId,
                            roleMtgId: roleMtgId,
                        })
                    }
                }
            }),
        ])

        return addedUsersFollowRole
    }

    async getAllIdsParticipantsInMeeting(meetingId: number): Promise<number[]> {
        const idsParticipants =
            await this.userMeetingRepository.getAllIdsParticipantInMeeting(
                meetingId,
            )
        return idsParticipants
    }
    async saveStatusUserMeeting(user: UserMeeting): Promise<UserMeeting> {
        const userMeeting =
            await this.userMeetingRepository.saveStatusUserMeeting(user)
        return userMeeting
    }

    async getAllParticipantsInMeeting(meetingId: number): Promise<number[]> {
        const idsParticipants =
            await this.userMeetingRepository.getAllIdsParticipantInMeeting(
                meetingId,
            )
        return idsParticipants
    }

    async getUserMeetingByUserIdAndMeetingId(
        userId: number,
        meetingId: number,
    ): Promise<UserMeeting> {
        const userMeeting = await this.userMeetingRepository.findOne({
            where: {
                userId,
                meetingId,
            },
        })
        return userMeeting
    }

    async getListUserIdPaticipantsByMeetingIdAndMeetingRole(
        meetingId: number,
        roleMtgId: number,
    ): Promise<number[]> {
        return await this.userMeetingRepository.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
            meetingId,
            roleMtgId,
        )
    }

    async getListUserToRemoveInMeeting(
        meetingId: number,
        newIdPaticipants: number[],
        roleMtgShareholderId: number,
    ): Promise<UserMeeting[]> {
        const listOldShareholderIds =
            await this.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
                meetingId,
                roleMtgShareholderId,
            )
        //id of user need to delete
        const idUsersToRemoves = listOldShareholderIds.filter(
            (userId) => !newIdPaticipants.includes(userId),
        )

        //Get User out meeting
        const usersToRemoves = await Promise.all([
            ...idUsersToRemoves.map((userId) =>
                this.userMeetingRepository.getParticipantMeetingById(
                    meetingId,
                    userId,
                    roleMtgShareholderId,
                ),
            ),
        ])
        return usersToRemoves
    }
    async getUserMeetingByUserIdAndMeetingIdAndStatus(
        userId: number,
        meetingId: number,
        statusUserWithMeeting: UserMeetingStatusEnum,
    ): Promise<UserMeeting> {
        const userMeeting = await this.userMeetingRepository.findOne({
            where: {
                userId: userId,
                meetingId: meetingId,
                status: statusUserWithMeeting,
            },
        })
        return userMeeting
    }

    async getListActiveBoardIdRemoveBoardMtg(
        meetingId: number,
        newIdBoards: number[],
    ): Promise<number[]> {
        const allParticipantsInMeeting =
            await this.userMeetingRepository.getAllIdsParticipantInBoardMeeting(
                meetingId,
            )

        //Get id of Role Host of Board Meeting
        const listRoleBoardMtg =
            await this.meetingRoleMtgService.getMeetingRoleMtgByMeetingId(
                meetingId,
            )

        const idOfHostRoleInMtg = listRoleBoardMtg
            .map((item) => item.roleMtg)
            .filter(
                (role) =>
                    role.roleName.toUpperCase() ===
                    RoleBoardMtgEnum.HOST.toUpperCase(),
            )[0]?.id

        const listIdOldBoardOfBoardMtg = Array.from(
            new Set(
                allParticipantsInMeeting
                    .filter(
                        (participant) =>
                            participant.roleMtgId !== idOfHostRoleInMtg,
                    )
                    .map((user) => user.userId),
            ),
        )

        const boardIdRemoveBoardMtg = listIdOldBoardOfBoardMtg.filter(
            (userId) => !newIdBoards.includes(userId),
        )

        //Get board active out meeting
        const userIdsActiveToRemoves = (
            await Promise.all([
                ...boardIdRemoveBoardMtg.map((userId) =>
                    this.userService.getActiveUserById(userId),
                ),
            ])
        ).map((board) => board.id)

        return userIdsActiveToRemoves
    }

    async getAllParticipantInviteMeeting(meetingId: number) {
        const participants =
            await this.userMeetingRepository.getAllParticipantInviteMeeting(
                meetingId,
            )
        // console.log(participants);
        return participants
    }

    async getTotalQuantityShareByParticipantId(
        meetingId: number,
        shareholderIds: number[],
        roleMeetingId: number,
    ): Promise<number> {
        const shareholderParticipant = await Promise.all([
            ...shareholderIds.map((shareholderId) =>
                this.userMeetingRepository.getParticipantMeetingById(
                    meetingId,
                    shareholderId,
                    roleMeetingId,
                ),
            ),
        ])

        const totalShare = shareholderParticipant.reduce(
            (accumulator, currentValue) => {
                if (currentValue.quantityShare) {
                    accumulator =
                        accumulator + Number(currentValue.quantityShare)
                }
                return accumulator
            },
            0,
        )

        return totalShare
    }

    async getParticipantInMeeting(
        meetingId: number,
        userId: number,
        roleMtgId: number,
    ): Promise<UserMeeting> {
        const participant =
            await this.userMeetingRepository.getParticipantMeetingById(
                meetingId,
                userId,
                roleMtgId,
            )

        return participant
    }
}
