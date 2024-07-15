import { User } from '@prisma/client'

interface PrivateUser {
    id: string
    phoneNumber: string
    createdAt: Date
    onboardingCompleted: boolean
    profilePicture: string | null
}

export function privateUserTransformer(user: User): PrivateUser {
    return {
        id: user.id,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        onboardingCompleted: user.onboardingCompleted,
        profilePicture: user.profilePicture,
    }
}

