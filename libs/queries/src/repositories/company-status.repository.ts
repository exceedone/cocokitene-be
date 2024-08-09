import { CompanyStatus } from '@entities/company-status.entity'
import { CompanyStatusEnum } from '@shares/constants/company.const'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { GetAllCompanyStatusDto } from '@dtos/company.dto'
import { paginate, paginateRaw, Pagination } from 'nestjs-typeorm-paginate'

@CustomRepository(CompanyStatus)
export class CompanyStatusRepository extends Repository<CompanyStatus> {
    async getCompanyStatusByStatusType(
        statusType: CompanyStatusEnum,
    ): Promise<CompanyStatus> {
        const companyStatus = await this.findOne({
            where: {
                status: statusType,
            },
        })
        return companyStatus
    }

    async getAllCompanyStatus(
        options: GetAllCompanyStatusDto,
    ): Promise<Pagination<CompanyStatus>> {
        const { page, limit, searchQuery } = options
        const queryBuilder = await this.createQueryBuilder(
            'company_status_mst',
        ).select([
            'company_status_mst.status',
            'company_status_mst.id',
            'company_status_mst.description',
        ])
        if (searchQuery) {
            queryBuilder.andWhere('company_status_mst.status like :status', {
                status: `%${searchQuery}%`,
            })
        }
        return paginate(queryBuilder, { page, limit })
    }

    async getCompanyStatusById(statusId: number): Promise<CompanyStatus> {
        const companyStatus = await this.findOne({
            where: {
                id: statusId,
            },
        })
        return companyStatus
    }

    async getAllCompanyByStatusId(
        options: GetAllCompanyStatusDto,
    ): Promise<Pagination<CompanyStatus>> {
        const { page, limit } = options
        const queryBuilder = await this.createQueryBuilder('company_status_mst')
            .select(['company_status_mst.status', 'company_status_mst.id'])
            .leftJoin(
                'company',
                'companies',
                'company_status_mst.id = companies.statusId',
            )
            .addSelect(`COUNT(DISTINCT companies.id)`, 'totalCompany')
            .groupBy('company_status_mst.id')

        return paginateRaw(queryBuilder, { page, limit })
    }
}
