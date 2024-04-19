import { Repository } from 'typeorm'
import { RoleMtg } from '@entities/role-mtg.entity'
import { CustomRepository } from '@shares/decorators'
import { RoleMtgEnum, TypeRoleMeeting } from '@shares/constants'
import { HttpException, HttpStatus } from '@nestjs/common'
import { httpErrors } from '@shares/exception-filter'
import { GetAllRoleMtgDto } from '@dtos/role-mtg.dto'
import { paginate, Pagination } from 'nestjs-typeorm-paginate'

@CustomRepository(RoleMtg)
export class RoleMtgRepository extends Repository<RoleMtg> {
    async createCompanyRole(
        roleMtg: RoleMtgEnum,
        companyId: number,
        description?: string,
    ): Promise<RoleMtg> {
        try {
            const createCompanyRoleMtg = await this.create({
                roleName: roleMtg,
                companyId: companyId,
                description: description,
                type: TypeRoleMeeting.BOTH_MTG,
            })
            if (roleMtg === RoleMtgEnum.SHAREHOLDER) {
                createCompanyRoleMtg.type = TypeRoleMeeting.SHAREHOLDER_MTG
            }
            await createCompanyRoleMtg.save()
            return createCompanyRoleMtg
        } catch (error) {
            throw new HttpException(
                httpErrors.COMPANY_ROLE_MTG_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getAllRoleMtgByCompanyIdAndTypeRoleMtg(
        options: GetAllRoleMtgDto,
        companyId: number,
    ): Promise<Pagination<RoleMtg>> {
        const { page, limit, searchQuery, type } = options

        const queryBuilder = this.createQueryBuilder('role_mtg')
            .select([
                'role_mtg.id',
                'role_mtg.roleName',
                'role_mtg.description',
                'role_mtg.type',
            ])
            .where('role_mtg.companyId = :companyId', {
                companyId: companyId,
            })
            .andWhere('role_mtg.type IN (:...types) ', {
                types: [type, TypeRoleMeeting.BOTH_MTG],
            })
        if (searchQuery) {
            queryBuilder.andWhere('role_mtg.roleName like :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            })
        }
        queryBuilder.orderBy('role_mtg.roleName', 'ASC')
        return paginate(queryBuilder, { page, limit })
    }

    async getAllRoleMtgByCompanyId(
        options: GetAllRoleMtgDto,
        companyId: number,
    ): Promise<Pagination<RoleMtg>> {
        const { page, limit, searchQuery } = options
        const queryBuilder = this.createQueryBuilder('role_mtg')
            .select([
                'role_mtg.id',
                'role_mtg.roleName',
                'role_mtg.description',
                'role_mtg.type',
            ])
            .where('role_mtg.companyId = :companyId', {
                companyId: companyId,
            })

        if (searchQuery) {
            queryBuilder.andWhere('role_mtg.roleName like :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            })
        }
        queryBuilder.orderBy('role_mtg.roleName', 'ASC')
        return paginate(queryBuilder, { page, limit })
    }
}
