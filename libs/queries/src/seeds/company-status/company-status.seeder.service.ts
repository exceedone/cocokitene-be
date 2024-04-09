import { Injectable, Logger } from '@nestjs/common'
import { InsertCompanyStatusDto, companyStatusesData } from './data'
import { CompanyStatus } from '@entities/company-status.entity'
import { CompanyStatusRepository } from '@repositories/company-status.repository'

@Injectable()
export class CompanyStatusSeederService {
    constructor(
        private readonly companyStatusRepository: CompanyStatusRepository,
    ) {}

    async saveOneCompanyStatus(
        status: InsertCompanyStatusDto,
    ): Promise<CompanyStatus> {
        const existedCompanyStatus = await this.companyStatusRepository.findOne(
            {
                where: {
                    status: status.status,
                },
            },
        )
        if (existedCompanyStatus) {
            Logger.error(
                `Duplicate status with name: ${existedCompanyStatus.status} status already exists`,
            )
            return
        }
        const createCompanyStatus = await this.companyStatusRepository.create(
            status,
        )
        await createCompanyStatus.save()
        Logger.log(
            `company_status______inserted__company_status__id: ` +
                createCompanyStatus.id,
        )
        return createCompanyStatus
    }
    async seedCompanyStatus() {
        const savePromises = companyStatusesData.map((companyStatus) =>
            this.saveOneCompanyStatus(companyStatus),
        )
        Logger.debug('company_status______start_seeding__company_status')
        await Promise.all(savePromises)
        Logger.log('company_status______end_seeding__company_status')
    }
}
