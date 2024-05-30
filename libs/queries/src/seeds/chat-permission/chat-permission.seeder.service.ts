import { Injectable, Logger } from '@nestjs/common'
import {
    ChatPermissionData,
    InsertChatPermissionDto,
} from '@seeds/chat-permission/data'
import { ChatPermission } from '@entities/chat-permission.entity'
import { ChatPermissionRepository } from '@repositories/chat-permission.repository'

@Injectable()
export class ChatPermissionSeederService {
    constructor(
        private readonly chatPermissionRepository: ChatPermissionRepository,
    ) {}

    async saveOneChatPermission(
        ChatPermission: InsertChatPermissionDto,
    ): Promise<ChatPermission> {
        const existedChatPermission =
            await this.chatPermissionRepository.findOne({
                where: {
                    name: ChatPermission.name,
                },
            })
        if (existedChatPermission) {
            Logger.error(
                `Duplicate type with name: ${existedChatPermission.name} already exists`,
            )
            return
        }

        const createdChatPermission =
            await this.chatPermissionRepository.create(ChatPermission)
        await createdChatPermission.save()
        Logger.log(
            'ChatPermission______inserted__ChatPermission__id: ' +
                createdChatPermission.id,
        )
        return createdChatPermission
    }

    async seedChatPermission() {
        const savePromises = ChatPermissionData.map((ChatPermission) =>
            this.saveOneChatPermission(ChatPermission),
        )

        Logger.debug('ChatPermission______start__seeding__ChatPermission')
        await Promise.all(savePromises)
        Logger.log('ChatPermission______end__seeding__ChatPermission')
    }
}
