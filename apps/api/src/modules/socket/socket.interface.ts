import { userChatInfo } from '../messages/message.interface'

export interface messageChatInformation {
    meetingId: number
    receiver: userChatInfo
    sender: userChatInfo
    content: string
    replyMessage?: {
        id: number
        senderId: userChatInfo
        receiverId: userChatInfo
        content: string
    }
}
