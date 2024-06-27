import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { loginUser, registerUser } from '../services/auth.service'
import { privateUserTransformer } from '../transformers/user.transformer'
import { createAccessToken } from '../utils/token.util'
import { authMiddleware } from '../middlewares/auth.middleware'

export const authController = new Hono()

const zRegisterSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-z0-9-]+$/, "Username must only contain lowercase letters, numbers, or hyphens."),
    password: z.string(),
})

// Create a new account
authController.post('/register', zValidator('json', zRegisterSchema), async (c) => {
    // TODO: ship app with asymetric encryption key, to encrypt password for added scurity
    const data = c.req.valid('json')
    const out = await registerUser(data)
    if (out.status === 201 && out.data) {
        // parse and return
        const token = await createAccessToken(out.data)
        return c.json({ user: privateUserTransformer(out.data), token, message: out.message }, out.status)
    } else {
        return c.json({ message: out.message }, out.status)
    }
})

const zLoginSchema = z.object({
    username: z.string(),
    password: z.string(),
})

// Login
authController.post('/login', zValidator('json', zLoginSchema), async (c) => {
    const data = c.req.valid('json')

    const out = await loginUser(data)
    if (out.status === 200 && out.data) {
        // parse and return
        const token = await createAccessToken(out.data)
        return c.json({ user: privateUserTransformer(out.data), token, message: out.message }, out.status)
    } else {
        return c.json({ message: out.message }, out.status)
    }
})

authController.get('/me', authMiddleware, (c) =>
    c.json(
        { user: privateUserTransformer(c.var.auth.user) },
        200
    )
)
