import { TypeOrmExModule } from '@shares/modules'
import { ReactionIconRepository } from '@repositories/reaction-icon.repository'
import { Module } from '@nestjs/common'
import { ReactionIconSeederService } from '@seeds/reaction-icon/reaction-icon.seeder.service'

const repositories = TypeOrmExModule.forCustomRepository([
    ReactionIconRepository,
])

@Module({
    imports: [repositories],
    providers: [ReactionIconSeederService],
    exports: [ReactionIconSeederService],
})
export class ReactionIconSeederModule {}
