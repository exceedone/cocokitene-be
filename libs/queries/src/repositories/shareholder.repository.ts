import {
    GetAllShareholderDto,
    UpdateShareholderDto,
} from '@dtos/shareholder.dto'

import { User } from '@entities/user.entity'
import { CustomRepository } from '@shares/decorators'
import { Pagination, paginateRaw } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'

@CustomRepository(User)
export class ShareholderRepository extends Repository<User> {
    async getAllShareholderCompany(
        options: GetAllShareholderDto,
        companyId: number,
    ): Promise<Pagination<User>> {
        const { page, limit, searchQuery, sortOrder } = options

        const queryBuilder = this.createQueryBuilder('users')
            .select([
                'users.id',
                'users.username',
                'users.email',
                'users.walletAddress',
                'users.avatar',
                'users.companyId',
                'users.defaultAvatarHashColor',
                'users.createdAt',
                'users.updatedAt',
                'users.shareQuantity',
                'GROUP_CONCAT(role.role ORDER BY role.role ASC ) as listRoleResponse',
            ])
            .leftJoinAndSelect('users.userStatus', 'userStatus')
            .leftJoin('users.userRole', 'userRole')
            .leftJoin('userRole.role', 'role')
            .where('users.shareQuantity IS NOT NULL')
            .andWhere('users.companyId = :companyId', {
                companyId,
            })
            .andWhere('role.companyId = :companyId', { companyId })
            .having('listRoleResponse LIKE :roleContaining', {
                roleContaining: '%SHAREHOLDER%',
            })
            .groupBy('users.id')

        if (searchQuery) {
            queryBuilder
                .andWhere('(users.username like :username', {
                    username: `%${searchQuery}%`,
                })
                .orWhere('users.email like :email)', {
                    email: `%${searchQuery}%`,
                })
        }
        if (sortOrder) {
            queryBuilder.orderBy('users.updatedAt', sortOrder)
        }

        return paginateRaw(queryBuilder, { page, limit })
    }

    async getShareholderById(
        companyId: number,
        shareholderId: number,
    ): Promise<User> {
        const shareholder = await this.createQueryBuilder('users')
            .select([
                'users.username',
                'users.email',
                'users.phone',
                'users.walletAddress',
                'users.defaultAvatarHashColor',
                'users.avatar',
                'users.shareQuantity',
            ])
            .leftJoin('users.company', 'company')
            .addSelect(['company.id', 'company.companyName'])
            .leftJoin('users.userStatus', 'userStatus')
            .addSelect(['userStatus.id', 'userStatus.status'])
            .where('users.companyId = :companyId', {
                companyId,
            })
            .andWhere('users.id = :shareholderId', {
                shareholderId,
            })
            .andWhere('users.shareQuantity IS NOT NULL')
            .getOne()
        return shareholder
    }

    async updateShareholder(
        companyId: number,
        shareholderId: number,
        updateShareholderDto: UpdateShareholderDto,
    ): Promise<User> {
        await this.createQueryBuilder('users')
            .update(User)
            .set({
                username: updateShareholderDto.username,
                walletAddress: updateShareholderDto.walletAddress || null,
                shareQuantity: updateShareholderDto.shareQuantity || null,
                email: updateShareholderDto.email,
                phone: updateShareholderDto.phone,
                statusId: updateShareholderDto.statusId,
                avatar: updateShareholderDto.avatar,
            })
            .where('users.id = :shareholderId', {
                shareholderId,
            })
            .andWhere('users.company_id = :companyId', {
                companyId: companyId,
            })
            .execute()

        const shareholder = await this.findOne({
            where: {
                id: shareholderId,
            },
            select: [
                'id',
                'username',
                'email',
                'walletAddress',
                'avatar',
                'statusId',
                'companyId',
                'shareQuantity',
                'defaultAvatarHashColor',
                'phone',
            ],
        })

        return shareholder
    }
}
