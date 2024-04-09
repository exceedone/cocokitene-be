import { Injectable, Logger } from '@nestjs/common'
import { CompanyRepository } from '@repositories/company.repository'
import { PlanRepository } from '@repositories/plan.repository'
import { CompanyStatusRepository } from '@repositories/company-status.repository'
import { InsertCompanyDto, companyData } from './data'
import { Company } from '@entities/company.entity'
import { CompanyStatusEnum } from '@shares/constants/company.const'

@Injectable()
export class CompanySeederService {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly planRepository: PlanRepository,
        private readonly companyStatusRepository: CompanyStatusRepository,
    ) {}
    async saveOneCompany(company: InsertCompanyDto): Promise<Company> {
        const existedCompany = await this.companyRepository.findOne({
            where: {
                email: company.email,
            },
        })
        if (existedCompany) {
            Logger.error(
                `Duplicate company with email: ${company.email} already exists`,
            )
            return
        }
        const createCompany = await this.companyRepository.create(company)
        await createCompany.save()
        Logger.log('company________insertd__company_id: ' + createCompany.id)
        return createCompany
    }

    async seedCompany() {
        // Only companies with active status can be saved to the database
        const companyStatus =
            await this.companyStatusRepository.getCompanyStatusByStatusType(
                CompanyStatusEnum.ACTIVE,
            )
        if (!companyStatus) {
            Logger.error(`acvite status is not available. `)
            return
        }
        // ========end check companyStatus=======
        // test demo seed data for company with plan
        const planNameDemo = 'free'
        const plan = await this.planRepository.findOne({
            where: {
                planName: planNameDemo,
            },
        })
        if (!plan) {
            Logger.error(`planName'plan is not available. `)
            return
        }
        const companySeedData: InsertCompanyDto[] = companyData.map(
            (company) => ({
                ...company,
                statusId: companyStatus.id,
                planId: plan.id,
            }),
        )
        const saveCompanyPromises = companySeedData.map((company) =>
            this.saveOneCompany(company),
        )
        Logger.debug('company______start__seeding__data')
        await Promise.all(saveCompanyPromises)
        Logger.log('company______end__seeding__data')
    }
}
