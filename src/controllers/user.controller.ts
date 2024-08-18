import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../../prisma/client'
import { publicUserTransformer } from '../transformers/user.transformer'

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
            users.map(publicUserTransformer)
    }, 200)
})

const zDiscoverUsernameSchema = z.object({
    username: z.string().max(32),
})

userController.get('/discover/username', zValidator('json', zDiscoverUsernameSchema), async (c) => {
    const data = c.req.valid('json')


    const users = await prisma.user.findMany({
        where: {
            username: data.username,
            usernameDiscoveryEnabled: true
        },
    })

    return c.json({
        users:
            users.map(publicUserTransformer)
    }, 200)
})

const zGetUserByIdSchema = z.object({
    id: z.string().uuid(),
})

userController.get('/id', zValidator('json', zGetUserByIdSchema), async (c) => {
    const data = c.req.valid('json')

    const user = await prisma.user.findUnique({
        where: {
            id: data.id
        }
    })

    if (user) {
        return c.json({

            user: publicUserTransformer(user)
        }, 200)

    } else {
        return c.json({
            message: 'User not found'
        }, 404)

    }
})

