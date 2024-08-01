import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { RoleMtgRepository } from '@repositories/meeting-role.repository'
import { RoleMtgEnum, TypeRoleMeeting } from '@shares/constants'
import { RoleMtg } from '@entities/meeting-role.entity'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { Logger } from 'winston'
import {
    CreateRoleMtgDto,
    GetAllRoleMtgByTypeRoleMtgDto,
    GetAllRoleMtgDto,
    UpdateRoleMtgDto,
} from '@dtos/role-mtg.dto'
import { Pagination } from 'nestjs-typeorm-paginate'
import { MeetingRoleMtgService } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.service'
import { CompanyService } from '@api/modules/companys/company.service'

@Injectable()
export class RoleMtgService {
    constructor(
        private readonly roleMtgRepository: RoleMtgRepository,
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async createCompanyRoleMtg(
        role: RoleMtgEnum | string,
        companyId: number,
        description?: string,
        type?: TypeRoleMeeting,
    ): Promise<RoleMtg> {
        try {
            const createdCompanyRoleMtg =
                await this.roleMtgRepository.createCompanyRole(
                    role,
                    companyId,
                    description,
                    type,
                )
            return createdCompanyRoleMtg
        } catch (error) {
            this.logger.error(
                `${messageLog.CREATE_ROLE_MTG_FAILED.code} ${messageLog.CREATE_ROLE_MTG_FAILED.message} ${role}`,
            )
            throw new HttpException(
                httpErrors.COMPANY_ROLE_MTG_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getAllRoleMtgByCompanyIdAndTypeRoleMtg(
        getAllRoleMtgByTypeRoleMtgDto: GetAllRoleMtgByTypeRoleMtgDto,
        companyId: number,
    ): Promise<Pagination<RoleMtg>> {
        const roleMtgs =
            await this.roleMtgRepository.getAllRoleMtgByCompanyIdAndTypeRoleMtg(
                getAllRoleMtgByTypeRoleMtgDto,
                companyId,
            )
        return roleMtgs
    }
    async getAllRoleMtgByCompanyId(
        getAllRoleMtgDto: GetAllRoleMtgDto,
        companyId: number,
    ): Promise<Pagination<RoleMtg>> {
        const roleMtgs = await this.roleMtgRepository.getAllRoleMtgByCompanyId(
            getAllRoleMtgDto,
            companyId,
        )
        return roleMtgs
    }

    async getRoleMtgByNameAndCompanyId(
        roleMtg: string,
        companyId: number,
    ): Promise<RoleMtg> {
        const roleMtgResult = await this.roleMtgRepository.findOne({
            where: {
                roleName: roleMtg,
                companyId: companyId,
            },
        })
        return roleMtgResult
    }

    async getRoleMtgById(
        companyId: number,
        roleMtgId: number,
    ): Promise<RoleMtg> {
        const existedCompany = await this.companyService.getCompanyById(
            companyId,
        )
        if (!existedCompany) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        try {
            const roleMtgResult = await this.roleMtgRepository.findOne({
                where: {
                    id: roleMtgId,
                    companyId: companyId,
                },
            })
            return roleMtgResult
        } catch (error) {
            throw new HttpException(
                {
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async createRoleMtgWithType(
        createRoleMtgDto: CreateRoleMtgDto,
    ): Promise<RoleMtg> {
        const { roleName, description, type, companyId } = createRoleMtgDto
        const existedCompany = await this.companyService.getCompanyById(
            companyId,
        )
        if (!existedCompany) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        // const eixstedRoleMtg = await this.roleMtgRepository.findOne({
        //     where: {
        //         roleName: roleName,
        //     },
        // })
        // if (eixstedRoleMtg) {
        //     throw new HttpException(
        //         httpErrors.COMPANY_ROLE_MTG_EXISTED,
        //         HttpStatus.INTERNAL_SERVER_ERROR,
        //     )
        // }

        try {
            const createdRoleMtg = await this.createCompanyRoleMtg(
                roleName,
                companyId,
                description,
                type,
            )
            return createdRoleMtg
        } catch (error) {
            this.logger.error(
                `${messageLog.CREATE_ROLE_MTG_FAILED.code} ${messageLog.CREATE_ROLE_MTG_FAILED.message} ${roleName}`,
            )
            throw new HttpException(
                httpErrors.COMPANY_ROLE_MTG_CREATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async updateRoleMtgWithType(
        roleMtgId: number,
        companyId: number,
        updateRoleMtgDto: UpdateRoleMtgDto,
    ): Promise<RoleMtg> {
        const { roleName } = updateRoleMtgDto
        const existedCompany = await this.companyService.getCompanyById(
            companyId,
        )
        if (!existedCompany) {
            throw new HttpException(
                httpErrors.COMPANY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        let existedRoleMtg = await this.roleMtgRepository.findOne({
            where: {
                id: roleMtgId,
            },
        })
        if (!existedRoleMtg) {
            throw new HttpException(
                httpErrors.COMPANY_ROLE_MTG_NOT_EXISTED,
                HttpStatus.NOT_FOUND,
            )
        }

        try {
            existedRoleMtg = await this.roleMtgRepository.updateRoleMtgWithType(
                roleMtgId,
                companyId,
                updateRoleMtgDto,
            )
            return existedRoleMtg
        } catch (error) {
            this.logger.error(
                `${messageLog.UPDATE_ROLE_MTG_FAILED.code} ${messageLog.UPDATE_ROLE_MTG_FAILED.message} ${roleName}`,
            )
            throw new HttpException(
                httpErrors.COMPANY_ROLE_MTG_UPDATE_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
