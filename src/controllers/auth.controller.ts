import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { loginUser, verifyOtp } from '../services/auth.service'
import { privateUserTransformer } from '../transformers/user.transformer'
import { createAccessToken } from '../utils/token.util'
import { authMiddleware } from '../middlewares/auth.middleware'

export const authController = new Hono()

const phoneRegex = new RegExp(
    /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const zLoginSchema = z.object({
    phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number').startsWith('+49', 'We only support German phone numbers'),
})

// Login or register
authController.post('/login', zValidator('json', zLoginSchema), async (c) => {
    const data = c.req.valid('json')

    const out = await loginUser(data)
    return c.json({ message: out.message }, out.status)
})

const zVerifySchema = z.object({
    phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number'),
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
