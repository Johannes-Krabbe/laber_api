import { Message } from '@prisma/client'

export function privateMessageTransformer(message: Message, senderUserId: string) {
    return {
        id: message.id,
        senderDeviceId: message.senderDeviceId,
        senderUserId,
        content: message.content,
        unixCreatedAt: message.createdAt.getTime(),
    }
}
