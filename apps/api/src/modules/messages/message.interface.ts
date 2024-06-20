export interface DataChatResponseDetail {
    rootChat: number
    messageChat: DataMessageChat[]
}

export interface userChatInfo {
    id: number
    email: string
}
export interface DataMessageChat {
    id: number
    sender: userChatInfo
    receiver: userChatInfo
    content: string
    createdAt: Date
    replyMessage?: {
        id: number
        senderId: userChatInfo
        receiverId: userChatInfo
        content: string
    }
    reactions?: {
        id: number
        userId: number
        messageId: number
        emoji: {
            id: number
            key: string
        }
    }[]
}
