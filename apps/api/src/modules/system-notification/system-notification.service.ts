import {
    createSystemNotificationDto,
    getAllSysNotificationDto,
    updateSystemNotificationDto,
} from '@dtos/system-notification.dto'
import { SystemNotification } from '@entities/system-notification.entity'
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { SystemNotificationRepository } from '@repositories/system-notification.repository'
import { httpErrors } from '@shares/exception-filter'
import { Pagination } from 'nestjs-typeorm-paginate'

@Injectable()
export class SystemNotificationService {
    constructor(
        private readonly systemNotificationRepository: SystemNotificationRepository,
        @Inject('winston')
        private readonly logger: Logger,
    ) {}

    async createSystemNotification(
        createSysNotification: createSystemNotificationDto,
        systemId: number,
    ): Promise<SystemNotification> {
        try {
            const createdSysNotification =
                await this.systemNotificationRepository.createSystemNotification(
                    createSysNotification,
                    systemId,
                )

            return createdSysNotification
        } catch (error) {
            throw new HttpException(
                httpErrors.CREATE_SYS_NOTIFICATION_FAILED,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    async getAllSystemNotification(
        getAllSysNotificationDto: getAllSysNotificationDto,
    ): Promise<Pagination<SystemNotification>> {
        const sysNotification =
            await this.systemNotificationRepository.getAllSysNotification(
                getAllSysNotificationDto,
            )

        return sysNotification
    }

    async updateSystemNotification(
        sysNotificationId: number,
        updateSysNotification: updateSystemNotificationDto,
        systemAdminId: number,
    ): Promise<SystemNotification> {
        const updatedSysNotification =
            await this.systemNotificationRepository.updateSysNotification(
                sysNotificationId,
                updateSysNotification,
                systemAdminId,
            )

        return updatedSysNotification
    }
}
