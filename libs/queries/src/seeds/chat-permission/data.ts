import { PartialType } from '@nestjs/mapped-types'
import { ChatPermission } from '@entities/chat-permission.entity'
import { ChatPermissionEnum } from '@shares/constants'

export class InsertChatPermissionDto extends PartialType(ChatPermission) {}

export const ChatPermissionData: InsertChatPermissionDto[] = [
    {
        name: ChatPermissionEnum.HOST_ONLY,
        description: 'Only hosts are allowed to text',
    },
    {
        name: ChatPermissionEnum.EVERY_PUBLIC,
        description: 'All chats are public, there is no private chat mode',
    },
    {
        name: ChatPermissionEnum.EVERY_PUBLIC_PRIVATE,
        description: 'There are both public and private chats for everyone',
    },
]
