import { UserSeenMessage } from '@entities/seen-messages.entity'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserSeenMessageRepository } from '@repositories/seen-messages.repository'
import { httpErrors } from '@shares/exception-filter'

@Injectable()
export class UserSeenMessageService {
    constructor(
        private readonly userSeenMessageRepository: UserSeenMessageRepository,
    ) {}

    async getLastMessageUserSeenByMeetingId(
        userId: number,
        meetingId: number,
    ): Promise<UserSeenMessage> {
        try {
            const lastMessage =
                await this.userSeenMessageRepository.getLaseMessageUserSeenByMeetingId(
                    userId,
                    meetingId,
                )

            return lastMessage
        } catch (error) {
            console.log('error: ', error)
            throw new HttpException({}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async updateLastMessageUserSeen(
        userId: number,
        meetingId: number,
        lastMessageIdUserSeen: number,
    ): Promise<UserSeenMessage> {
        try {
            await this.userSeenMessageRepository.getLaseMessageUserSeenByMeetingId(
                userId,
                meetingId,
            )
            //Update Last MessageId User Seen
            const updateLastMessageUserSeen =
                await this.userSeenMessageRepository.updateLastMessageSeenByUser(
                    userId,
                    meetingId,
                    lastMessageIdUserSeen,
                )
            return updateLastMessageUserSeen
        } catch (error) {
            throw new HttpException(
                httpErrors.UPDATE_MESSAGE_SEEN_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
