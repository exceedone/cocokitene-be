import { Module } from '@nestjs/common'
import { PermissionController } from '@api/modules/permissions/permission.controller'
import { PermissionService } from '@api/modules/permissions/permission.service'

@Module({
    controllers: [PermissionController],
    providers: [PermissionService],
    exports: [PermissionService],
})
export class PermissionModule {}
