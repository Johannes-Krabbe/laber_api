import { createMiddleware } from 'hono/factory'
import { User } from '@prisma/client'
import { TokenPayload, verifyAccessToken } from '../utils/token.util'
import { prisma } from '../../prisma/client'

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
        return c.json({ message: 'No token provided' }, 401)
    }

    let tokenPayload: TokenPayload | null
    try {
        tokenPayload = await verifyAccessToken(token)
    } catch (e) {
        return c.json({ message: 'Invalid token' }, 401)
    }

    if (!tokenPayload) {
        return c.json({ message: 'Invalid token' }, 401)
    }

    if (!tokenPayload.userId) {
        return c.json({ message: 'Invalid token' }, 401)
    }

    const user = await prisma.user.findUnique({
        where: {
            id: tokenPayload.userId,
        },
    })

    if (!user) {
        return c.json({ message: 'Invalid token' }, 401)
    }

    c.set('auth', { user })

    await next()
})
