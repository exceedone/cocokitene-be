import { forwardRef, Module } from '@nestjs/common'
import { RolePermissionController } from '@api/modules/role-permissions/role-permission.controller'
import { RolePermissionService } from '@api/modules/role-permissions/role-permission.service'
import { CompanyModule } from '@api/modules/companys/company.module'
import { RoleModule } from '@api/modules/roles/role.module'
import { PermissionModule } from '@api/modules/permissions/permission.module'

@Module({
    controllers: [RolePermissionController],
    providers: [RolePermissionService],
    exports: [RolePermissionService],
    imports: [
        forwardRef(() => CompanyModule),
        forwardRef(() => RoleModule),
        PermissionModule,
    ],
})
export class RolePermissionModule {}
