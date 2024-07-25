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

