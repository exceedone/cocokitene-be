import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { RoleMtgRepository } from '@repositories/role-mtg.repository'
import { RoleMtgEnum } from '@shares/constants'
import { RoleMtg } from '@entities/role-mtg.entity'
import { httpErrors, messageLog } from '@shares/exception-filter'
import { Logger } from 'winston'
import { GetAllRoleMtgDto } from '@dtos/role-mtg.dto'
import { Pagination } from 'nestjs-typeorm-paginate'
import { MeetingRoleMtgService } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.service'

@Injectable()
export class RoleMtgService {
    constructor(
        private readonly roleMtgRepository: RoleMtgRepository,
        private readonly meetingRoleMtgService: MeetingRoleMtgService,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async createCompanyRoleMtg(
        role: RoleMtgEnum,
        companyId: number,
        description?: string,
    ): Promise<RoleMtg> {
        try {
            const createdCompanyRoleMtg =
                await this.roleMtgRepository.createCompanyRole(
                    role,
                    companyId,
                    description,
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
        getAllRoleMtgDto: GetAllRoleMtgDto,
        companyId: number,
    ): Promise<Pagination<RoleMtg>> {
        const roleMtgs =
            await this.roleMtgRepository.getAllRoleMtgByCompanyIdAndTypeRoleMtg(
                getAllRoleMtgDto,
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

    async getRoleMtgById(roleMtgId: number): Promise<RoleMtg> {
        const roleMtgResult = await this.roleMtgRepository.findOne({
            where: {
                id: roleMtgId,
            },
        })
        return roleMtgResult
    }
}
