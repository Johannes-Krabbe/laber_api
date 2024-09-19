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
    profilePicture: string | null
    name: string | null
    username: string | null
    phoneNumberHash?: string
    phoneNumber?: string
}

export function publicUserTransformer(
    user: User,
    options: {
        includePhoneNumber: boolean
    }
): PublicUser {
    let out: PublicUser = {
        id: user.id,
        profilePicture: user.profilePicture,
        name: user.name,
        username: user.username,
    }

    if (options.includePhoneNumber) {
        out = {
            ...out,
            phoneNumberHash: user.phoneNumberHash,
            phoneNumber: user.phoneNumber,
        }
    }
    return out
}
