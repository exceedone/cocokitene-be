import { Repository } from 'typeorm'
import { ChatPermission } from '@entities/chat-permission.entity'
import { CustomRepository } from '@shares/decorators'
import { GetAllChatPermissionDto } from '@dtos/chat-permission.dto'
import { Pagination, paginate } from 'nestjs-typeorm-paginate'

@CustomRepository(ChatPermission)
export class ChatPermissionRepository extends Repository<ChatPermission> {
    async getAllChatPermission(
        options: GetAllChatPermissionDto,
    ): Promise<Pagination<ChatPermission>> {
        const { page, limit, searchQuery } = options
        const queryBuilder = await this.createQueryBuilder(
            'chat_permission_mst',
        ).select([
            'chat_permission_mst.id',
            'chat_permission_mst.name',
            'chat_permission_mst.description',
        ])
        if (searchQuery) {
            queryBuilder.andWhere('chat_permission_mst.name like : name', {
                name: `%${searchQuery}%`,
            })
        }
        return paginate(queryBuilder, { page, limit })
    }
}
