import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { loginUser, updateUser, verifyOtp } from '../services/auth.service'
import { privateUserTransformer } from '../transformers/user.transformer'
import { createAccessToken } from '../utils/token.util'
import { authMiddleware } from '../middlewares/auth.middleware'
import { validateAndParsePhoneNumber } from '../utils/phonenumber.util'

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

    const cleanedPhoneNumber = validateAndParsePhoneNumber(data.phoneNumber)
    if (!cleanedPhoneNumber) {
        return c.json({ message: 'Invalid phone number' }, 400)
    }

    const out = await loginUser({
        ...data,
        phoneNumber: cleanedPhoneNumber
    })
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

const zUpdateMeSchema = z.object({
    username: z.string().optional(),
    profilePicture: z.string().optional(),
    name: z.string().optional(),
})

authController.post('/me/update', authMiddleware, zValidator('json', zUpdateMeSchema), async (c) => {
    const data = c.req.valid('json')
    const out = await updateUser(c.var.auth.user.id, data)
    return c.json({ message: out.message }, out.status)
})
