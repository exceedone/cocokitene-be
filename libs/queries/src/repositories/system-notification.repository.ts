import {
    createSystemNotificationDto,
    getAllSysNotificationDto,
    updateSystemNotificationDto,
} from '@dtos/system-notification.dto'
import { SystemNotification } from '@entities/system-notification.entity'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Sort_By_Order } from '@shares/constants'
import { CustomRepository } from '@shares/decorators'
import { paginateRaw, Pagination } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'

@CustomRepository(SystemNotification)
export class SystemNotificationRepository extends Repository<SystemNotification> {
    async createSystemNotification(
        createSysNotificationDto: createSystemNotificationDto,
        systemId: number,
    ): Promise<SystemNotification> {
        try {
            const systemNotification = await this.create({
                ...createSysNotificationDto,
                createSystemId: systemId,
            })
            await systemNotification.save()
            return systemNotification
        } catch (error) {
            console.log('Error: ', error)
        }
    }

    async getAllSysNotification(
        getAllSysNotificationDto: getAllSysNotificationDto,
    ): Promise<Pagination<SystemNotification>> {
        const queryBuilder = this.createQueryBuilder('system_notification')
            // .select()
            .leftJoin('system_notification.creator', 'creator')
            .addSelect(['creator.id', 'creator.username', 'creator.email'])
            .leftJoin('system_notification.updater', 'updater')
            .addSelect(['updater.id', 'updater.username', 'updater.email'])
        queryBuilder.orderBy(
            'system_notification.created_at',
            Sort_By_Order.DESC,
        )

        return paginateRaw(queryBuilder, getAllSysNotificationDto)
    }

    async updateSysNotification(
        sysNotificationId: number,
        updateSysNotificationDto: updateSystemNotificationDto,
        systemAdminId: number,
    ): Promise<SystemNotification> {
        try {
            await this.createQueryBuilder('system_notification')
                .update(SystemNotification)
                .set({
                    title: updateSysNotificationDto.title,
                    content: updateSysNotificationDto.content,
                    updatedSystemId: systemAdminId,
                })
                .where('system_notification.id = :sysNotificationId', {
                    sysNotificationId: sysNotificationId,
                })
                .execute()

            const sysNotification = await this.findOne({
                where: {
                    id: sysNotificationId,
                },
            })
            return sysNotification
        } catch (error) {
            throw new HttpException(
                { message: 'Update System Notification failed' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
