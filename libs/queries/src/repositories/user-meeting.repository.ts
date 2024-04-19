import { Like, Repository } from 'typeorm'
import { CustomRepository } from '@shares/decorators'
import { UserMeeting } from '@entities/user-meeting.entity'
import { CreateUserMeetingDto } from '@dtos/user-meeting.dto'
import { UserMeetingStatusEnum } from '@shares/constants/meeting.const'

@CustomRepository(UserMeeting)
export class UserMeetingRepository extends Repository<UserMeeting> {
    async createUserMeeting(
        createUserMeetingDto: CreateUserMeetingDto,
    ): Promise<UserMeeting> {
        const { userId, meetingId, roleMtgId, status } = createUserMeetingDto

        const createdUserMeeting = await this.create({
            userId,
            meetingId,
            roleMtgId,
            status,
        })
        return await createdUserMeeting.save()
        // return createdUserMeeting
    }

    async getUserMeetingByMeetingIdAndRole(
        meetingId: number,
        roleMtgId: number,
    ): Promise<UserMeeting[]> {
        const userMeetingEnded = await this.find({
            where: {
                meetingId,
                roleMtgId,
            },
            select: {
                id: true,
                status: true,
                user: {
                    id: true,
                    username: true,
                    email: true,
                    avatar: true,
                    defaultAvatarHashColor: true,
                    shareQuantity: true,
                },
            },
            relations: ['user'],
            order: {
                status: 'ASC',
            },
        })

        return userMeetingEnded
    }

    async getListUserIdPaticipantsByMeetingIdAndMeetingRole(
        meetingId: number,
        roleMtgId: number,
    ): Promise<number[]> {
        const listUserMeetingFollowRoles = await this.find({
            where: {
                meetingId: meetingId,
                roleMtgId: roleMtgId,
            },
        })
        const listIdUserMeetingFollowRoles = listUserMeetingFollowRoles.map(
            (listUserMeetingFollowRole) => listUserMeetingFollowRole.userId,
        )
        return listIdUserMeetingFollowRoles
    }

    async removeUserFromMeeting(
        userId: number,
        meetingId: number,
        roleMtgId: number,
    ) {
        const existeduserMeeting = await this.findOne({
            where: {
                userId: userId,
                meetingId: meetingId,
                roleMtgId: roleMtgId,
            },
        })

        if (existeduserMeeting) {
            await this.remove(existeduserMeeting)
        }
    }

    async getAllIdsParticipantInMeeting(meetingId: number): Promise<number[]> {
        const participants = await this.find({
            where: {
                meetingId: meetingId,
            },
        })

        const idsParticipant = participants.map(
            (participant) => participant.userId,
        )
        const specificIdsParticipant = Array.from(new Set(idsParticipant))
        return specificIdsParticipant
    }

    async saveStatusUserMeeting(
        userMeeting: UserMeeting,
    ): Promise<UserMeeting> {
        userMeeting.status = UserMeetingStatusEnum.PARTICIPATE
        await userMeeting.save()
        return userMeeting
    }
    async getAllParticipantInMeeting(meetingId: number, searchValue: string) {
        const base = {
            meetingId: meetingId,
        }
        const participants = await this.find({
            where: [
                {
                    ...base,
                    user: {
                        username: Like(`%${searchValue || ''}%`),
                    },
                },
                {
                    ...base,
                    user: {
                        email: Like(`%${searchValue || ''}%`),
                    },
                },
            ],
            relations: {
                user: true,
            },
            order: {
                status: 'ASC',
            },
        })
        return participants
    }
}
