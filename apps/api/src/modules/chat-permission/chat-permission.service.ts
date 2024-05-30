import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ChatPermissionRepository } from '@repositories/chat-permission.repository'
import { ChatPermissionEnum } from '@shares/constants'
import { ChatPermission } from '@entities/chat-permission.entity'

@Injectable()
export class ChatPermissionService {
    constructor(
        private readonly chatPermissionRepository: ChatPermissionRepository,
    ) {}

    async getChatPermissionByName(
        name: ChatPermissionEnum,
    ): Promise<ChatPermission> {
        try {
            const chatPermission = await this.chatPermissionRepository.findOne({
                where: {
                    name: name,
                },
            })
            return chatPermission
        } catch (error) {
            throw new HttpException(
                { message: error.message },
                HttpStatus.NOT_FOUND,
            )
        }
    }
}
