import { forwardRef, Module } from '@nestjs/common'
import { RoleMtgController } from '@api/modules/role-mtgs/role-mtg.controller'
import { RoleMtgService } from '@api/modules/role-mtgs/role-mtg.service'
import { MeetingRoleMtgModule } from '@api/modules/meeting-role-mtgs/meeting-role-mtg.module'
import { CompanyModule } from '@api/modules/companys/company.module'

@Module({
    imports: [MeetingRoleMtgModule, forwardRef(() => CompanyModule)],
    controllers: [RoleMtgController],
    providers: [RoleMtgService],
    exports: [RoleMtgService],
})
export class RoleMtgModule {}
