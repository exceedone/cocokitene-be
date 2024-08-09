import { UserRoleService } from '@api/modules/user-roles/user-role.service'
import {
    GetAllShareholderDto,
    UpdateShareholderDto,
} from '@dtos/shareholder.dto'

import { User } from '@entities/user.entity'
import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { ShareholderRepository } from '@repositories/shareholder.repository'
import { Pagination } from 'nestjs-typeorm-paginate'

import { CompanyService } from '@api/modules/companys/company.service'
import { httpErrors } from '@shares/exception-filter'
import { DetailShareholderReponse } from './shareholder.interface'
import { UserService } from '../users/user.service'
import { Logger } from 'winston'
@Injectable()
export class ShareholderService {
    constructor(
        private readonly shareholderRepository: ShareholderRepository,
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
        private readonly userRoleService: UserRoleService,
        private readonly userService: UserService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async getAllShareholderInCompany(
        getAllShareholdersDto: GetAllShareholderDto,
        companyId: number,
    ): Promise<Pagination<User>> {
        const users = await this.shareholderRepository.getAllShareholderCompany(
            getAllShareholdersDto,
            companyId,
        )
        // this.logger.info(
        //     '[DAPP] Get all shareholder successfully in company with id: ' +
        //         companyId,
        // )
        return users
    }

    async getShareholderById(
        companyId: number,
        shareholderId: number,
    ): Promise<DetailShareholderReponse> {
        const existedCompany = await this.companyService.getCompanyById(
            companyId,
        )
        if (!existedCompany) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        const existedShareholder =
            await this.shareholderRepository.getShareholderById(
                companyId,
                shareholderId,
            )
        if (!existedShareholder) {
            throw new HttpException(
                httpErrors.SHAREHOLDER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        const rolesByShareholderId =
            await this.userRoleService.getRolesByUserId(shareholderId)

        return {
            ...existedShareholder,
            roles: rolesByShareholderId,
        }
    }

    async updateShareholder(
        companyId: number,
        shareholderId: number,
        updateShareholderDto: UpdateShareholderDto,
    ) {
        const existedCompany = await this.companyService.getCompanyById(
            companyId,
        )
        if (!existedCompany) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        let existedShareholder = await this.shareholderRepository.findOne({
            where: {
                id: shareholderId,
                companyId: companyId,
            },
        })
        if (!existedShareholder) {
            throw new HttpException(
                httpErrors.SHAREHOLDER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }

        let existedShareholder1: User
        if (updateShareholderDto.walletAddress) {
            existedShareholder1 =
                await this.userService.getUserByWalletAddressExactly(
                    updateShareholderDto.walletAddress,
                )
            if (
                existedShareholder1 &&
                existedShareholder1.walletAddress !==
                    existedShareholder.walletAddress
            ) {
                throw new HttpException(
                    httpErrors.DUPLICATE_WALLET_ADDRESS,
                    HttpStatus.BAD_REQUEST,
                )
            }
        }

        existedShareholder1 = await this.userService.getUserByEmailExactly(
            updateShareholderDto.email,
        )
        if (
            existedShareholder1 &&
            existedShareholder1.email !== existedShareholder.email
        ) {
            throw new HttpException(
                httpErrors.DUPLICATE_EMAIL_USER,
                HttpStatus.BAD_REQUEST,
            )
        }

        //Update shareholder
        try {
            existedShareholder =
                await this.shareholderRepository.updateShareholder(
                    companyId,
                    shareholderId,
                    updateShareholderDto,
                )
        } catch (error) {
            throw new HttpException(
                httpErrors.SHAREHOLDER_UPDATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        const { roleIds } = updateShareholderDto
        await this.userRoleService.updateUserRole(shareholderId, roleIds)

        return existedShareholder
    }
}
