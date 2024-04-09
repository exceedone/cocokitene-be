import { Injectable, Logger } from '@nestjs/common'
import { UserStatusRepository } from '@repositories/user-status.repository'
import { InsertUserStatusDto, userStatusesData } from '@seeds/user-status/data'
import { UserStatus } from '@entities/user-status.entity'

@Injectable()
export class UserStatusSeederService {
    constructor(private readonly userStatusRepository: UserStatusRepository) {}

    async saveOneUserStatus(status: InsertUserStatusDto): Promise<UserStatus> {
        const existedUserStatus = await this.userStatusRepository.findOne({
            where: {
                status: status.status,
            },
        })

        if (existedUserStatus) {
            Logger.error(
                `Duplicate status with name: ${existedUserStatus.status} status already exists`,
            )
            return
        }

        const createdUserStatus = await this.userStatusRepository.create(status)
        await createdUserStatus.save()
        Logger.log(
            'user_status______inserted__user_status__id: ' +
                createdUserStatus.id,
        )
        return createdUserStatus
    }

    async seedUserStatus() {
        const savePromises = userStatusesData.map((userStatus) =>
            this.saveOneUserStatus(userStatus),
        )

        Logger.debug('user_status______start__seeding__user_status')
        await Promise.all(savePromises)
        Logger.log('user_status______end__seeding__user_status')
    }
}
