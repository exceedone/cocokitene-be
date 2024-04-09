import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { SystemAdminSeederService } from '@seeds/system-admin/system-admin.seeder.service'
import { SystemAdminRepository } from '@repositories/system-admin.repository'

const repositories = TypeOrmExModule.forCustomRepository([
    SystemAdminRepository,
])
@Module({
    imports: [repositories],
    providers: [SystemAdminSeederService],
    exports: [SystemAdminSeederService],
})
export class SystemAdminSeederModule {}
