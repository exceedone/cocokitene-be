import { Injectable } from '@nestjs/common'
import { GetAllUserStatusDto } from '@dtos/user-status.dto'
import { Pagination } from 'nestjs-typeorm-paginate'
import { UserStatus } from '@entities/user-status.entity'
import { UserStatusRepository } from '@repositories/user-status.repository'

@Injectable()
export class UserStatusService {
    constructor(private readonly userStatusRepository: UserStatusRepository) {}
    async getAllUserStatus(
        getAllUserStatusDto: GetAllUserStatusDto,
    ): Promise<Pagination<UserStatus>> {
        const userStatus = await this.userStatusRepository.getAllUserStatus(
            getAllUserStatusDto,
        )
        return userStatus
    }

    async getStatusById(statusId: number): Promise<UserStatus> {
        return await this.userStatusRepository.getUserStatusById(statusId)
    }

    async getAllUserByStatusId(): Promise<Pagination<UserStatus>> {
        const userStatuses =
            await this.userStatusRepository.countUserByStatusId({
                page: 1,
                limit: 10,
            })

        return userStatuses
    }
}
