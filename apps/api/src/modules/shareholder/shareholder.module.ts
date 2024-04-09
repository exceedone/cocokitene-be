import { forwardRef, Module } from '@nestjs/common'
import { ShareholderService } from '@api/modules/shareholder/shareholder.service'
import { ShareholderController } from '@api/modules/shareholder/shareholder.controller'
import { CompanyModule } from '@api/modules/companys/company.module'
import { UserRoleModule } from '@api/modules/user-roles/user-role.module'
import { UserModule } from '../users/user.module'
@Module({
    imports: [
        forwardRef(() => CompanyModule),
        forwardRef(() => UserModule),
        UserRoleModule,
    ],
    controllers: [ShareholderController],
    providers: [ShareholderService],
    exports: [ShareholderService],
})
export class ShareholderModule {}
