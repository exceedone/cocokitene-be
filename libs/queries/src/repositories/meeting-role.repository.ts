import { Repository } from 'typeorm'
import { RoleMtg } from '@entities/meeting-role.entity'
import { CustomRepository } from '@shares/decorators'
import { RoleMtgEnum, TypeRoleMeeting } from '@shares/constants'
import { HttpException, HttpStatus } from '@nestjs/common'
import { httpErrors } from '@shares/exception-filter'
import {
    GetAllRoleMtgByTypeRoleMtgDto,
    GetAllRoleMtgDto,
    UpdateRoleMtgDto,
} from '@dtos/role-mtg.dto'
import { paginate, Pagination } from 'nestjs-typeorm-paginate'

@CustomRepository(RoleMtg)
export class RoleMtgRepository extends Repository<RoleMtg> {
    async createCompanyRole(
        roleMtg: RoleMtgEnum | string,
        companyId: number,
        description?: string,
        type?: TypeRoleMeeting,
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
            if (type) {
                createCompanyRoleMtg.type = type
                await createCompanyRoleMtg.save()
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
        options: GetAllRoleMtgByTypeRoleMtgDto,
        companyId: number,
    ): Promise<Pagination<RoleMtg>> {
        const { page, limit, searchQuery, type } = options

        const queryBuilder = this.createQueryBuilder('meeting_role')
            .select([
                'meeting_role.id',
                'meeting_role.roleName',
                'meeting_role.description',
                'meeting_role.type',
            ])
            .where('meeting_role.companyId = :companyId', {
                companyId: companyId,
            })
            .andWhere('meeting_role.type IN (:...types) ', {
                types: [type, TypeRoleMeeting.BOTH_MTG],
            })
        if (searchQuery) {
            queryBuilder.andWhere('meeting_role.roleName like :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            })
        }
        queryBuilder.orderBy('meeting_role.roleName', 'ASC')
        return paginate(queryBuilder, { page, limit })
    }

    async getAllRoleMtgByCompanyId(
        options: GetAllRoleMtgDto,
        companyId: number,
    ): Promise<Pagination<RoleMtg>> {
        const { page, limit, searchQuery } = options
        const queryBuilder = this.createQueryBuilder('meeting_role')
            .select([
                'meeting_role.id',
                'meeting_role.roleName',
                'meeting_role.description',
                'meeting_role.type',
            ])
            .where('meeting_role.companyId = :companyId', {
                companyId: companyId,
            })

        if (searchQuery) {
            queryBuilder.andWhere('meeting_role.roleName like :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            })
        }
        queryBuilder.orderBy('meeting_role.roleName', 'ASC')
        return paginate(queryBuilder, { page, limit })
    }

    async updateRoleMtgWithType(
        roleMtgId: number,
        companyId: number,
        updateRoleMtgDto: UpdateRoleMtgDto,
    ): Promise<RoleMtg> {
        try {
            await this.createQueryBuilder('meeting_role')
                .update(RoleMtg)
                .set({
                    roleName: updateRoleMtgDto.roleName,
                    type: updateRoleMtgDto.type,
                    description: updateRoleMtgDto.description,
                })
                .where('meeting_role.id = :roleMtgId', {
                    roleMtgId: roleMtgId,
                })

                .execute()
            const roleMtg = await this.findOne({
                where: {
                    id: roleMtgId,
                    companyId: companyId,
                },
            })

            return roleMtg
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
