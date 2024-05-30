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
        const queryBuilder = this.createQueryBuilder('companys')
            .select([
                'companys.id',
                'companys.companyName',
                'companys.representativeUser',
            ])
            .leftJoin(
                'company_statuses',
                'companyStatus',
                'companyStatus.id = companys.statusId',
            )
            .leftJoin('plans_mst', 'plan', 'plan.id = companys.planId')
            .leftJoin('meetings', 'meeting', 'companys.id = meeting.companyId')
            .leftJoin('users', 'user', 'user.companyId = companys.id')
            .addSelect(`COUNT(DISTINCT  meeting.id)`, 'totalCreatedMTGs')
            .addSelect(`plan.planName`, 'planName')
            .addSelect(`companyStatus.status`, 'companyStatus')
            .addSelect(`COUNT(DISTINCT user.id) `, 'totalCreatedAccount')
            .groupBy('companys.id')

        if (searchQuery) {
            queryBuilder.andWhere('(companys.companyName like :companyName)', {
                companyName: `%${searchQuery}%`,
            })
        }
        if (sortOrder) {
            queryBuilder.orderBy('companys.updatedAt', sortOrder)
        }
        return paginateRaw(queryBuilder, { page, limit })
    }
    async updateCompany(
        companyId: number,
        updateCompanyDto: UpdateCompanyDto,
    ): Promise<Company> {
        try {
            await this.createQueryBuilder('companys')
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
                .where('companys.id = :companyId', { companyId })
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
}
