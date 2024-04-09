import { CreateUserMeetingDto } from '@dtos/user-meeting.dto'
import { UserMeeting } from '@entities/user-meeting.entity'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { UserMeetingRepository } from '@repositories/user-meeting.repository'
import {
    MeetingRole,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'
import { httpErrors } from '@shares/exception-filter'
import { UserService } from '@api/modules/users/user.service'
import { User } from '@entities/user.entity'
import { Logger } from 'winston'
@Injectable()
export class UserMeetingService {
    constructor(
        private readonly userMeetingRepository: UserMeetingRepository,
        // private readonly userService: UserService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async createUserMeeting(
        createUserMeetingDto: CreateUserMeetingDto,
    ): Promise<UserMeeting> {
        const { userId, meetingId, role, status } = createUserMeetingDto
        try {
            const createdUserMeeting =
                await this.userMeetingRepository.createUserMeeting({
                    userId,
                    meetingId,
                    role,
                    status,
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
        role: MeetingRole,
    ): Promise<UserMeeting[]> {
        const userMeetings =
            await this.userMeetingRepository.getUserMeetingByMeetingIdAndRole(
                meetingId,
                role,
            )

        return userMeetings
    }
    async updateUserMeeting(
        meetingId: number,
        meetingRole: MeetingRole,
        newIdPaticipants: number[],
    ): Promise<number[]> {
        const listUserIds =
            await this.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
                meetingId,
                meetingRole,
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
                    meetingRole,
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
                    await this.createUserMeeting({
                        userId: usersToAdd,
                        meetingId: meetingId,
                        role: meetingRole,
                        status: UserMeetingStatusEnum.PARTICIPATE,
                    })
                } else {
                    await this.createUserMeeting({
                        userId: usersToAdd,
                        meetingId: meetingId,
                        role: meetingRole,
                    })
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
        meetingRole: MeetingRole,
    ): Promise<number[]> {
        return await this.userMeetingRepository.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
            meetingId,
            meetingRole,
        )
    }

    async getListUserToRemoveInMeeting(
        meetingId: number,
        newIdPaticipants: number[],
    ): Promise<User[]> {
        const listOldShareholderIds =
            await this.getListUserIdPaticipantsByMeetingIdAndMeetingRole(
                meetingId,
                MeetingRole.SHAREHOLDER,
            )
        //id of user need to delete
        const idUsersToRemoves = listOldShareholderIds.filter(
            (userId) => !newIdPaticipants.includes(userId),
        )
        const usersToRemoves = await Promise.all([
            ...idUsersToRemoves.map((id) =>
                this.userService.getActiveUserById(id),
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
}
