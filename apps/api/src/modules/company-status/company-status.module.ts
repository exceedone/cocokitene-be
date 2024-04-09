import { Module } from '@nestjs/common'
import { CompanyStatusService } from '@api/modules/company-status/company-status.service'

@Module({
    providers: [CompanyStatusService],
    exports: [CompanyStatusService],
})
export class CompanyStatusModule {}
