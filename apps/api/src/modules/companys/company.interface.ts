import { Company } from '@entities/company.entity'
import { User } from '@sentry/node'
import { Plan } from '@entities/plan.entity'

export interface DetailCompanyResponse extends Partial<Company> {
    superAdminInfo: Partial<User>
    servicePlan: Partial<Plan>
}
