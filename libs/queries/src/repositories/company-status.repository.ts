import { CompanyStatus } from '@entities/company-status.entity'
import { CompanyStatusEnum } from '@shares/constants/company.const'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { GetAllCompanyStatusDto } from '@dtos/company.dto'
import { paginate, Pagination } from 'nestjs-typeorm-paginate'

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
            'company_statuses',
        ).select([
            'company_statuses.status',
            'company_statuses.id',
            'company_statuses.description',
        ])
        if (searchQuery) {
            queryBuilder.andWhere('company_statuses.status like :status', {
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
}
