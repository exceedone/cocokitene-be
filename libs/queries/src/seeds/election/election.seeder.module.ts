import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { ElectionRepository } from '@repositories/election.repository'
import { ElectionSeederService } from '@seeds/election/election.seeder.service'

const repositories = TypeOrmExModule.forCustomRepository([ElectionRepository])
@Module({
    imports: [repositories],
    providers: [ElectionSeederService],
    exports: [ElectionSeederService],
})
export class ElectionSeederModule {}
