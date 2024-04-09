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
        const comapnyStatus =
            await this.companyStatusRepository.getAllCompanyStatus(
                getAllCompanyStatusDto,
            )
        return comapnyStatus
    }
    async getCompanyStatusById(statusId: number): Promise<CompanyStatus> {
        const companyStatus =
            await this.companyStatusRepository.getCompanyStatusById(statusId)
        return companyStatus
    }
}
