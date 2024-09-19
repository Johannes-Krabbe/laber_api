import { createMiddleware } from 'hono/factory'
import { User } from '@prisma/client'
import { TokenPayload, verifyAccessToken } from '../utils/token.util'
import { prisma } from '../../prisma/client'
import { THROW_ERROR } from '../types/error.type'

interface AuthMiddlewareVars {
    user: User
}

export const authMiddleware = createMiddleware<{
    Variables: {
        auth: AuthMiddlewareVars
    }
}>(async (c, next) => {
    let token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
        token = c.req.header('Authorization')
    }

    if (!token) {
        return THROW_ERROR.NO_TOKEN_PROVIDED('err0013')
    }

    let tokenPayload: TokenPayload | null
    try {
        tokenPayload = await verifyAccessToken(token)
    } catch (e) {
        return THROW_ERROR.INVALID_TOKEN('err0014')
    }

    if (!tokenPayload) {
        return THROW_ERROR.INVALID_TOKEN('err0015')
    }

    if (!tokenPayload.userId) {
        return THROW_ERROR.INVALID_TOKEN('err0016')
    }

    const user = await prisma.user.findUnique({
        where: {
            id: tokenPayload.userId,
        },
    })

    if (!user) {
        return THROW_ERROR.USER_ALREADY_DELETED('err0018')
    }

    c.set('auth', { user })

    await next()
})
