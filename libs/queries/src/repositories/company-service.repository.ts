import {
    ServicePlanForCompanyDto,
    UpdateCreatedServicePlanForCompanyDto,
} from '@dtos/company-service.dto'
import { CompanyServicePlan } from '@entities/company-service.entity'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'

@CustomRepository(CompanyServicePlan)
export class CompanyServicePlanRepository extends Repository<CompanyServicePlan> {
    async getCompanyServicePlanByCompanyId(
        companyId: number,
    ): Promise<CompanyServicePlan> {
        const servicePlanCompany = await this.findOne({
            where: {
                companyId: companyId,
            },
            relations: ['plan', 'company'],
        })

        return servicePlanCompany
    }

    async createServicePlanForCompany(
        createServicePlanForCompanyDto: ServicePlanForCompanyDto,
        systemAdminId: number,
    ): Promise<CompanyServicePlan> {
        const servicePlanCreated = await this.create({
            ...createServicePlanForCompanyDto,
            meetingCreated: 0,
            accountCreated: 1,
            storageUsed: 0,
            createdSystemId: systemAdminId,
        })

        await servicePlanCreated.save()

        return servicePlanCreated
    }

    async updateServicePlanOfCompany(
        id: number,
        updateServicePlanForCompanyDto: ServicePlanForCompanyDto,
    ): Promise<CompanyServicePlan> {
        await this.createQueryBuilder('company_service')
            .update(CompanyServicePlan)
            .set({
                planId: updateServicePlanForCompanyDto.planId,
                meetingLimit: updateServicePlanForCompanyDto.meetingLimit,
                meetingCreated: 0,
                accountLimit: updateServicePlanForCompanyDto.accountLimit,
                accountCreated: 0,
                storageLimit: updateServicePlanForCompanyDto.storageLimit,
                expirationDate: updateServicePlanForCompanyDto.expirationDate,
            })
            .where('company_service.id = :id', { id: id })
            .execute()

        const servicePlanCompanyById = await this.findOne({
            where: {
                id: id,
            },
        })

        return servicePlanCompanyById
    }

    async updateCreatedOfServicePlanOfCompany(
        id: number,
        updateCreatedServicePlanForCompanyDto: UpdateCreatedServicePlanForCompanyDto,
    ): Promise<CompanyServicePlan> {
        await this.createQueryBuilder('company_service')
            .update(CompanyServicePlan)
            .set({
                meetingCreated:
                    updateCreatedServicePlanForCompanyDto.meetingCreated,
                accountCreated:
                    updateCreatedServicePlanForCompanyDto.accountCreated,
                storageUsed: updateCreatedServicePlanForCompanyDto.storageUsed,
            })
            .where('company_service.id = :id', { id: id })
            .execute()

        const servicePlanCompanyById = await this.findOne({
            where: {
                id: id,
            },
        })

        return servicePlanCompanyById
    }

    async getServicePlanNearingExpiration(): Promise<CompanyServicePlan[]> {
        const beforeExpired7daysAgo = new Date()
        // beforeExpired7daysAgo.setUTCHours(0, 0, 0, 0)
        // subtract 7 days
        beforeExpired7daysAgo.setDate(beforeExpired7daysAgo.getDate() + 14)

        const beforeExpired14daysAgo = new Date()
        // beforeExpired14daysAgo.setUTCHours(0, 0, 0, 0)
        // subtract 14 days
        beforeExpired14daysAgo.setDate(beforeExpired14daysAgo.getDate() + 30)

        const queryBuilder = await this.createQueryBuilder('company_service')
            .select([
                'company_service.id',
                'company_service.companyId',
                'company_service.planId',
                'company_service.meetingLimit',
                'company_service.meetingCreated',
                'company_service.accountLimit',
                'company_service.accountCreated',
                'company_service.storageLimit',
                'company_service.storageUsed',
                'company_service.expirationDate',
            ])
            .where(
                '(DAY(company_service.expirationDate) = :day7 AND MONTH(company_service.expirationDate) = :month7 AND YEAR(company_service.expirationDate) = :year7) OR (DAY(company_service.expirationDate) = :day14 AND MONTH(company_service.expirationDate) = :month14 AND YEAR(company_service.expirationDate) = :year14)',
                {
                    day7: beforeExpired7daysAgo.getDate(),
                    month7: beforeExpired7daysAgo.getMonth() + 1,
                    year7: beforeExpired7daysAgo.getFullYear(),
                    day14: beforeExpired14daysAgo.getDate(),
                    month14: beforeExpired14daysAgo.getMonth() + 1,
                    year14: beforeExpired14daysAgo.getFullYear(),
                },
            )
            .getMany()

        return queryBuilder
    }

    async getAllCompanyExpiredService(): Promise<CompanyServicePlan[]> {
        const beforeCurrentDate = new Date()
        beforeCurrentDate.setDate(beforeCurrentDate.getDate() - 1)

        const companyExpiredService = this.createQueryBuilder('company_service')
            .select([
                'company_service.id',
                'company_service.companyId',
                'company_service.planId',
                'company_service.meetingLimit',
                'company_service.meetingCreated',
                'company_service.accountLimit',
                'company_service.accountCreated',
                'company_service.storageLimit',
                'company_service.storageUsed',
                'company_service.expirationDate',
            ])
            .where(
                'DAY(company_service.expirationDate) = :day AND MONTH(company_service.expirationDate) = :month AND YEAR(company_service.expirationDate) = :year',
                {
                    day: beforeCurrentDate.getDate(),
                    month: beforeCurrentDate.getMonth() + 1,
                    year: beforeCurrentDate.getFullYear(),
                },
            )
            .getMany()

        return companyExpiredService
    }
}
