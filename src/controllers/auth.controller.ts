import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { loginUser, updateUser, verifyOtp } from '../services/auth.service'
import { privateUserTransformer } from '../transformers/user.transformer'
import { createAccessToken } from '../utils/token.util'
import { authMiddleware } from '../middlewares/auth.middleware'
import { zNameValidator, zPhoneNumberValidator, zUsernameValidator } from '../validators/user.validators'

export const authController = new Hono()

const zLoginSchema = z.object({
    phoneNumber: zPhoneNumberValidator,
})

// Login or register
authController.post('/login', zValidator('json', zLoginSchema), async (c) => {
    const data = c.req.valid('json')

    const out = await loginUser(data)
    return c.json({ message: out.message }, out.status)
})

const zVerifySchema = z.object({
    phoneNumber: zPhoneNumberValidator,
    otp: z.string().length(6)
})

// Verify user
authController.post('/verify', zValidator('json', zVerifySchema), async (c) => {
    const data = c.req.valid('json')
    const out = await verifyOtp(data)
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

const zUpdateUserSchema = z.object({
    username: zUsernameValidator.nullish(),
    name: zNameValidator.nullish(),
    phoneNumber: zPhoneNumberValidator.nullish(),
    phoneNumberDiscoveryEnabled: z.boolean().nullish(),
    usernameDiscoveryEnabled: z.boolean().nullish(),
})

authController.put('/me/update', zValidator('json', zUpdateUserSchema), authMiddleware, async (c) => {
    const data = c.req.valid('json')
    const out = await updateUser(c.var.auth.user.id, {
        username: data.username ?? undefined,
        name: data.name ?? undefined,
        phoneNumber: data.phoneNumber ?? undefined,
        phoneNumberDiscoveryEnabled: data.phoneNumberDiscoveryEnabled ?? undefined,
        usernameDiscoveryEnabled: data.usernameDiscoveryEnabled ?? undefined,
    })
    return c.json({ message: out.message }, out.status)
})
