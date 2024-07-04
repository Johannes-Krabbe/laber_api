import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from "../../prisma/client";

export const deviceController = new Hono()
import { z } from 'zod'
import { authMiddleware } from '../middlewares/auth.middleware'
import { createDevice } from '../services/device.service'
import { validateX25519KeyString } from '../utils/x25519.util';


const zCreateDeviceSchema = z.object({
    deviceName: z.string().min(3).max(20),
    identityKey: z.string().refine(validateX25519KeyString, { message: 'Invalid identity key' }),
    signedPreKey: z.object({
        key: z.string().refine((validateX25519KeyString), { message: 'Invalid signed pre key' }),
        signature: z.string().length(64),
    }),
    oneTimePreKeys: z.array(z.string().refine(validateX25519KeyString, { message: 'Invalid one time pre key' })).min(5),
})

deviceController.post('/', authMiddleware, zValidator('json', zCreateDeviceSchema), async (c) => {
    const user = c.var.auth.user
    const data = c.req.valid('json')
    const out = await createDevice({ ...data, user })
    return c.json({ message: out.message }, out.status)
})

deviceController.get('/all', authMiddleware, async (c) => {
    const devices = await prisma.device.findMany({
        where: {
            userId: c.var.auth.user.id
        },
        include: {
            signedPreKey: true,
            oneTimePreKeys: true,
        }
    })

    return c.json({ devices }, 200)
})
