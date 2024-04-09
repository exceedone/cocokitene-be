import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { BlockRepository } from '@repositories/block.repository'
import { BlockService } from './block.service'

@Module({
    imports: [TypeOrmExModule.forCustomRepository([BlockRepository])],

    providers: [BlockService],
    exports: [BlockService],
})
export class BlockModule {}
