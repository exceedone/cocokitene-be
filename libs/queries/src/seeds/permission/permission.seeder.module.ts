import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { PermissionRepository } from '@repositories/permission.repository'
import { PermissionSeederService } from '@seeds/permission/permission.seeder.service'

const repositories = TypeOrmExModule.forCustomRepository([PermissionRepository])
@Module({
    imports: [repositories],
    providers: [PermissionSeederService],
    exports: [PermissionSeederService],
})
export class PermissionSeederModule {}
