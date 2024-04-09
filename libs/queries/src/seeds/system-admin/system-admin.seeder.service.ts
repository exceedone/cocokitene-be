import { Injectable, Logger } from '@nestjs/common'
import { InertSertSystemAdminDto, systemAdminData } from './data'
import { SystemAdmin, SystemAdminRepository } from '../..'

@Injectable()
export class SystemAdminSeederService {
    constructor(
        private readonly systemAdminRepository: SystemAdminRepository,
    ) {}

    async saveOneSystemAdmin(
        systemAdmin: InertSertSystemAdminDto,
    ): Promise<SystemAdmin> {
        const existedSystemAdmin = await this.systemAdminRepository.findOne({
            where: {
                email: systemAdmin.email,
            },
        })
        if (existedSystemAdmin) {
            Logger.error(`
                Duplicate system admin with email: ${systemAdmin.email} already exists
            `)
            return
        }
        const createdSystemAdmin = await this.systemAdminRepository.create(
            systemAdmin,
        )
        await createdSystemAdmin.save()
        Logger.log(
            `systemAdmin____inserted__systemadmin_id: ` + createdSystemAdmin.id,
        )
        return createdSystemAdmin
    }

    async seedSystemAdmin() {
        const savePromies = systemAdminData.map((systemAdmin) =>
            this.saveOneSystemAdmin(systemAdmin),
        )
        Logger.debug(`system_admin_____start_seeding__system_admin`)
        await Promise.all(savePromies)
        Logger.debug(`system_admin____end__seeding__system_admin`)
    }
}
