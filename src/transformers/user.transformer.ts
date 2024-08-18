import { User } from '@prisma/client'

interface PrivateUser {
    id: string
    phoneNumber: string
    unixCreatedAt: number
    onboardingCompleted: boolean
    profilePicture: string | null
    name: string | null
}

export function privateUserTransformer(user: User): PrivateUser {
    return {
        id: user.id,
        phoneNumber: user.phoneNumber,
        unixCreatedAt: user.createdAt.getTime(),
        onboardingCompleted: user.onboardingCompleted,
        profilePicture: user.profilePicture,
        name: user.name,
    }
}


interface PublicUser {
    id: string
    phoneNumberHash: string
    profilePicture: string | null
    name: string | null
    username: string | null
}

export function publicUserTransformer(user: User): PublicUser {
    return {
        id: user.id,
        phoneNumberHash: user.phoneNumberHash,
        profilePicture: user.profilePicture,
        name: user.name,
        username: user.username
    }

}
