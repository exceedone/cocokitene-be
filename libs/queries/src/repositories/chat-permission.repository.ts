import { Repository } from 'typeorm'
import { ChatPermission } from '@entities/chat-permission.entity'
import { CustomRepository } from '@shares/decorators'

@CustomRepository(ChatPermission)
export class ChatPermissionRepository extends Repository<ChatPermission> {}
