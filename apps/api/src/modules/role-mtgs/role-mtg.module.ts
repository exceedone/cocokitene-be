import { Module } from '@nestjs/common'
import { RoleMtgController } from '@api/modules/role-mtgs/role-mtg.controller'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'
import { MeetingRoleMtgModule } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.module'

@Module({
    imports: [MeetingRoleMtgModule],
    controllers: [RoleMtgController],
    providers: [RoleMtgService],
    exports: [RoleMtgService],
})
export class RoleMtgModule {}
