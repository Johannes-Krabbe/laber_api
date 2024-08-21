import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../../prisma/client'
import { publicUserTransformer } from '../transformers/user.transformer'
import { zCuidValidator } from '../mocks/validators/general.validators'

export const userController = new Hono()

const zDiscoverPhoneNumberSchema = z.object({
    phoneNumberHash: z.string().length(5),
})

userController.post('/discover/phone-number', zValidator('json', zDiscoverPhoneNumberSchema), async (c) => {
    const data = c.req.valid('json')

    const users = await prisma.user.findMany({
        where: {
            phoneNumberHash: {
                startsWith: data.phoneNumberHash
            },
            phoneNumberDiscoveryEnabled: true
        },
    })

    return c.json({
        users:
            users.map((user) => publicUserTransformer(user, { includePhoneNumber: true }))
    }, 200)
})

const zGetUserUsernameSchema = z.object({
    userId: zCuidValidator,
})

userController.get('/:userId', zValidator('param', zGetUserUsernameSchema), async (c) => {
    const data = c.req.valid('param')

    const user = await prisma.user.findUnique({
        where: {
            id: data.userId
        },
    })

    if (!user) {
        return c.json({
            message: 'User not found'
        }, 404)
    }

    return c.json({
        user: publicUserTransformer(user, { includePhoneNumber: false })
    }, 200)
})
