import { TypeOrmExModule } from '@shares/modules'
import { UserStatusRepository } from '@repositories/user-status.repository'
import { UserStatusSeederService } from '@seeds/user-status/user-status.seeder.service'
import { Module } from '@nestjs/common'

const repositories = TypeOrmExModule.forCustomRepository([UserStatusRepository])

@Module({
    imports: [repositories],
    providers: [UserStatusSeederService],
    exports: [UserStatusSeederService],
})
export class UserStatusSeederModule {}
