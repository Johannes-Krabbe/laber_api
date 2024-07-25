import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from "../../prisma/client";
import { z } from 'zod'
import { authMiddleware } from '../middlewares/auth.middleware'
import { createDevice } from '../services/device.service'
import { isValidEd25519KeyString } from '../utils/curve/ed25519.util';
import { isValidX25519KeyString } from '../utils/curve/x25519.util';
import { privateDeviceTransformer } from '../transformers/device.transformer';


export const deviceController = new Hono()

const zCreateDeviceSchema = z.object({
    deviceName: z.string().min(3).max(20),
    identityKey: z.string().refine(isValidEd25519KeyString, { message: 'Invalid identity key' }),
    signedPreKey: z.object({
        key: z.string().refine((isValidX25519KeyString), { message: 'Invalid signed pre key' }),
        signature: z.string(),
    }),
    oneTimePreKeys: z.array(z.string().refine(isValidX25519KeyString, { message: 'Invalid one time pre key' })).min(5),
})

deviceController.post('/', authMiddleware, zValidator('json', zCreateDeviceSchema), async (c) => {
    const user = c.var.auth.user
    const data = c.req.valid('json')
    const out = await createDevice({ ...data, user })
    if(!out.data || out.status !== 201) {
        console.log(out.message)
        return c.json({ message: out.message }, out.status)
    }
    return c.json({
        message: out.message, device: privateDeviceTransformer({
            ...out.data.device,
            signedPreKey: out.data.signedPreKey,
            oneTimePreKeys: out.data.oneTimePreKeys,
        })
    }, out.status)
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

    return c.json({ devices: devices.map((d) => privateDeviceTransformer(d)) }, 200)
})
