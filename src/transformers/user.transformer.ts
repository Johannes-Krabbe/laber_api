import { User } from '@prisma/client'

interface PrivateUser {
    id: string
    username: string
    createdAt: Date
}

export function privateUserTransformer(user: User): PrivateUser {
    return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
    }
}

