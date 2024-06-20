import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ChatPermissionRepository } from '@repositories/chat-permission.repository'
import { ChatPermissionEnum } from '@shares/constants'
import { ChatPermission } from '@entities/chat-permission.entity'
import { GetAllChatPermissionDto } from '@dtos/chat-permission.dto'
import { Pagination } from 'nestjs-typeorm-paginate'

@Injectable()
export class ChatPermissionService {
    constructor(
        private readonly chatPermissionRepository: ChatPermissionRepository,
    ) {}

    async getAllChatPermission(
        getAllChatPermissionDto: GetAllChatPermissionDto,
    ): Promise<Pagination<ChatPermission>> {
        const listChatPermission =
            await this.chatPermissionRepository.getAllChatPermission(
                getAllChatPermissionDto,
            )
        return listChatPermission
    }

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
