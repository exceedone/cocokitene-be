import { Like, Repository } from 'typeorm'
import { CustomRepository } from '@shares/decorators'
import { UserMeeting } from '@entities/user-meeting.entity'
import { CreateUserMeetingDto } from '@dtos/user-meeting.dto'
import {
    MeetingRole,
    UserMeetingStatusEnum,
} from '@shares/constants/meeting.const'

@CustomRepository(UserMeeting)
export class UserMeetingRepository extends Repository<UserMeeting> {
    async createUserMeeting(
        createUserMeetingDto: CreateUserMeetingDto,
    ): Promise<UserMeeting> {
        const { userId, meetingId, role, status } = createUserMeetingDto

        const createdUserMeeting = await this.create({
            userId,
            meetingId,
            role,
            status,
        })
        return await createdUserMeeting.save()
        // return createdUserMeeting
    }

    async getUserMeetingByMeetingIdAndRole(
        meetingId: number,
        role: MeetingRole,
    ): Promise<UserMeeting[]> {
        const userMeetingEnded = await this.find({
            where: {
                meetingId,
                role,
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
        meetingRole: MeetingRole,
    ): Promise<number[]> {
        const listUserMeetingFollowRoles = await this.find({
            where: {
                meetingId: meetingId,
                role: meetingRole,
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
        meetingRole: MeetingRole,
    ) {
        const existeduserMeeting = await this.findOne({
            where: {
                userId: userId,
                meetingId: meetingId,
                role: meetingRole,
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

        const rs = {
            hosts: [],
            controlBoards: [],
            directors: [],
            shareholders: [],
            administrativeCouncils: [],
        }
        participants.map((item) => {
            const participant = {
                defaultAvatarHashColor: item.user.defaultAvatarHashColor,
                avatar: item.user.avatar,
                name: item.user.username,
                joined: item.status === UserMeetingStatusEnum.PARTICIPATE,
            }
            switch (item.role) {
                case MeetingRole.HOST:
                    rs.hosts.push(participant)
                    break
                case MeetingRole.CONTROL_BOARD:
                    rs.controlBoards.push(participant)
                    break
                case MeetingRole.DIRECTOR:
                    rs.directors.push(participant)
                    break
                case MeetingRole.SHAREHOLDER:
                    rs.shareholders.push(participant)
                    break
                case MeetingRole.ADMINISTRATIVE_COUNCIL:
                    rs.administrativeCouncils.push(participant)

                default:
                    break
            }
        })
        return rs
    }
}
