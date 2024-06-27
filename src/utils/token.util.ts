import { sign, verify } from 'hono/jwt'
import { ENV } from '../env'
import { User } from '@prisma/client'

export enum TokenType {
    ACCESS = 'access',
}

export interface TokenPayload {
    userId: string
    tokenType: string
}

export function createAccessToken(user: User): Promise<string> {
    return sign(
        {
            userId: user.id,
            tokenType: TokenType.ACCESS,
        },
        ENV.JWT_SECRET
    )
}

export async function verifyAccessToken(
    token: string
): Promise<TokenPayload | null> {
    let verifiedToken
    try {
        verifiedToken = await verify(token, ENV.JWT_SECRET)
    } catch (error) {
        return null
    }

    if (verifiedToken.tokenType !== TokenType.ACCESS) {
        return null
    }

    return verifiedToken as unknown as TokenPayload
}
