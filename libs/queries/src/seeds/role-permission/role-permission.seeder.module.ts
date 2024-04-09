import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { RoleRepository } from '@repositories/role.repository'
import { PermissionRepository } from '@repositories/permission.repository'
import { RolePermissionSeederService } from '@seeds/role-permission/role-permission.seeder.service'
import { RolePermissionRepository } from '@repositories/role-permission.repository'
const repositories = TypeOrmExModule.forCustomRepository([
    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,
])
@Module({
    imports: [repositories],
    providers: [RolePermissionSeederService],
    exports: [RolePermissionSeederService],
})
export class RolePermissionSeederModule {}
