import { Module } from '@nestjs/common'
import { TypeOrmExModule } from '@shares/modules'
import { ChatPermissionRepository } from '@repositories/chat-permission.repository'
import { ChatPermissionSeederService } from '@seeds/chat-permission/chat-permission.seeder.service'

const repositories = TypeOrmExModule.forCustomRepository([
    ChatPermissionRepository,
])
@Module({
    imports: [repositories],
    providers: [ChatPermissionSeederService],
    exports: [ChatPermissionSeederService],
})
export class ChatPermissionSeederModule {}
