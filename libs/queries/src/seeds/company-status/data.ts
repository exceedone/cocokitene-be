import { CompanyStatus } from '@entities/company-status.entity'
import { PartialType } from '@nestjs/mapped-types'
import { CompanyStatusEnum } from '@shares/constants/company.const'

export class InsertCompanyStatusDto extends PartialType(CompanyStatus) {}

export const companyStatusesData: InsertCompanyStatusDto[] = [
    {
        status: CompanyStatusEnum.ACTIVE,
        description:
            'Company has active status that was approved by admin. The company can buy and sell products from now on.',
    },
    {
        status: CompanyStatusEnum.INACTIVE,
        description:
            'Company has acquire status,so the company can not buy and sell products from now on.',
    },
]
