import { Repository } from 'typeorm'
import { CustomRepository } from '@shares/decorators'
import { UserStatus } from '@entities/user-status.entity'
import { UserStatusEnum } from '@shares/constants'
import { GetAllUserStatusDto } from '@dtos/user-status.dto'
import { paginate, Pagination } from 'nestjs-typeorm-paginate'
@CustomRepository(UserStatus)
export class UserStatusRepository extends Repository<UserStatus> {
    async getUserStatusByStatusType(
        statusType: UserStatusEnum,
    ): Promise<UserStatus> {
        const userStatus = await this.findOne({
            where: {
                status: statusType,
            },
        })
        return userStatus
    }

    async getAllUserStatus(
        options: GetAllUserStatusDto,
    ): Promise<Pagination<UserStatus>> {
        const { page, limit, searchQuery } = options
        const queryBuilder = this.createQueryBuilder('user_statuses').select([
            'user_statuses.id',
            'user_statuses.status',
            'user_statuses.description',
        ])
        if (searchQuery) {
            queryBuilder.andWhere('user_statuses.status like :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            })
        }
        return paginate(queryBuilder, { page, limit })
    }

    async getUserStatusById(statusId: number): Promise<UserStatus> {
        const userStatus = await this.findOne({
            where: {
                id: statusId,
            },
        })
        return userStatus
    }
}
