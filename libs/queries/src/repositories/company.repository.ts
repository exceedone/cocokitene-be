import { Company } from '@entities/company.entity'
import { CustomRepository } from '@shares/decorators'
import { Repository } from 'typeorm'
import { paginateRaw, Pagination } from 'nestjs-typeorm-paginate'
import { CreateCompanyDto, GetAllCompanyDto } from '@dtos/company.dto'
import { UpdateCompanyDto } from '@dtos/company.dto'
import { HttpException, HttpStatus } from '@nestjs/common'
@CustomRepository(Company)
export class CompanyRepository extends Repository<Company> {
    async getCompanyByTaxCompany(tax): Promise<Company> {
        const company = await this.findOne({
            where: {
                taxNumber: tax,
            },
        })
        return company
    }

    async getCompanyByEmail(email): Promise<Company> {
        const company = await this.findOne({
            where: {
                email: email,
            },
        })
        return company
    }

    async getAllCompanys(
        options: GetAllCompanyDto,
    ): Promise<Pagination<Company>> {
        const { page, limit, searchQuery, sortOrder } = options
        const queryBuilder = this.createQueryBuilder('company')
            .select([
                'company.id',
                'company.companyName',
                'company.representativeUser',
            ])
            .leftJoin(
                'company_status_mst',
                'companyStatus',
                'companyStatus.id = company.statusId',
            )
            .leftJoin('plan_mst', 'plan', 'plan.id = company.planId')
            .leftJoin('meetings', 'meeting', 'company.id = meeting.companyId')
            .leftJoin('users', 'user', 'user.companyId = company.id')
            .addSelect(`COUNT(DISTINCT  meeting.id)`, 'totalCreatedMTGs')
            .addSelect(`plan.planName`, 'planName')
            .addSelect(`companyStatus.status`, 'companyStatus')
            .addSelect(`COUNT(DISTINCT user.id) `, 'totalCreatedAccount')
            .groupBy('company.id')

        if (searchQuery) {
            queryBuilder.andWhere('(company.companyName like :companyName)', {
                companyName: `%${searchQuery}%`,
            })
        }
        if (sortOrder) {
            queryBuilder.orderBy('company.updatedAt', sortOrder)
        }
        return paginateRaw(queryBuilder, { page, limit })
    }
    async updateCompany(
        companyId: number,
        updateCompanyDto: UpdateCompanyDto,
    ): Promise<Company> {
        try {
            await this.createQueryBuilder('company')
                .update(Company)
                .set({
                    companyName: updateCompanyDto.companyName,
                    companyShortName: updateCompanyDto.companyShortName,
                    description: updateCompanyDto.description,
                    address: updateCompanyDto.address,
                    email: updateCompanyDto.email,
                    phone: updateCompanyDto.phone,
                    fax: updateCompanyDto.fax,
                    taxNumber: updateCompanyDto.taxNumber,
                    businessType: updateCompanyDto.businessType,
                    dateOfCorporation: updateCompanyDto.dateOfCorporation,
                    statusId: updateCompanyDto.statusId,
                    planId: updateCompanyDto.planId,
                    representativeUser: updateCompanyDto.representativeUser,
                })
                .where('company.id = :companyId', { companyId })
                .execute()

            const company = await this.findOne({
                where: {
                    id: companyId,
                },
            })
            return company
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async createCompany(createCompanyDto: CreateCompanyDto): Promise<Company> {
        const company = await this.create({
            ...createCompanyDto,
        })
        await company.save()
        return company
    }

    async countCreatedOfCompany(companyId: number) {
        const company = await this.createQueryBuilder('company')
            .select(['company.id as id'])
            .where('company.id = :companyId', { companyId })
            .leftJoin('meetings', 'meeting', 'company.id = meeting.companyId')
            .leftJoin('users', 'user', 'user.companyId = company.id')
            .addSelect(`COUNT(DISTINCT  meeting.id)`, 'totalCreatedMTGs')
            .addSelect(`COUNT(DISTINCT user.id) `, 'totalCreatedAccount')
            .getRawOne()

        return company
    }
}
