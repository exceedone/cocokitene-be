import { ProposalFileService } from '@api/modules/proposal-files/proposal-file.service'
import { ProposalModule } from '@api/modules/proposals/proposal.module'
import { Module, forwardRef } from '@nestjs/common'

@Module({
    imports: [forwardRef(() => ProposalModule)],
    providers: [ProposalFileService],
    exports: [ProposalFileService],
})
export class ProposalFileModule {}
