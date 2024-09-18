import { Injectable } from '@nestjs/common'
import { GetAllCompanyStatusDto } from '@dtos/company.dto'
import { Pagination } from 'nestjs-typeorm-paginate'
import { CompanyStatus } from '@entities/company-status.entity'
import { CompanyStatusRepository } from '@repositories/company-status.repository'

@Injectable()
export class CompanyStatusService {
    constructor(
        private readonly companyStatusRepository: CompanyStatusRepository,
    ) {}
    async getAllCompanyStatus(
        getAllCompanyStatusDto: GetAllCompanyStatusDto,
    ): Promise<Pagination<CompanyStatus>> {
        const companyStatus =
            await this.companyStatusRepository.getAllCompanyStatus(
                getAllCompanyStatusDto,
            )
        return companyStatus
    }
    async getCompanyStatusById(statusId: number): Promise<CompanyStatus> {
        const companyStatus =
            await this.companyStatusRepository.getCompanyStatusById(statusId)
        return companyStatus
    }

    async getAllCompanyByStatusId(month: number, year: number) {
        const companyStatus =
            await this.companyStatusRepository.getAllCompanyByStatusId(
                month,
                year,
                {
                    page: 1,
                    limit: 100,
                },
            )

        return companyStatus
    }
}
