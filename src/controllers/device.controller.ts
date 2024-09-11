import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from "../../prisma/client";
import { z } from 'zod'
import { authMiddleware } from '../middlewares/auth.middleware'
import { createDevice } from '../services/device.service'
import { privateDeviceTransformer, publicDeviceTransformer } from '../transformers/device.transformer';
import { zCuidValidator } from '../validators/general.validators';
import { zEd25519KeyValidator, zX25519KeyValidator } from '../validators/key.validator';

export const deviceController = new Hono()

const zCreateDeviceSchema = z.object({
    deviceName: z.string().min(3).max(20),
    identityKey: zEd25519KeyValidator,
    signedPreKey: z.object({
        key: zX25519KeyValidator,
        signature: z.string(),
    }),
    oneTimePreKeys: z.array(zX25519KeyValidator).min(5),
})

deviceController.post('/', authMiddleware, zValidator('json', zCreateDeviceSchema), async (c) => {
    const user = c.var.auth.user
    const data = c.req.valid('json')
    const out = await createDevice({ ...data, user })
    if (!out.data || out.status !== 201) {
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

const zGetDeviceKeyBundleSchema = z.object({
    deviceId: zCuidValidator
})

deviceController.get('/key-bundle', zValidator('query', zGetDeviceKeyBundleSchema), async (c) => {
    // TODO - Implement rate limiting
    // users can only request keybundle for devices 3 times per month per user device

    const data = c.req.valid('query')

    const device = await prisma.device.findUnique({
        where: {
            id: data.deviceId
        },
        include: {
            signedPreKey: true,
            oneTimePreKeys: {
                take: 1
            },
            identityKey: true,
        }
    })

    if (!device) {
        return c.json({ message: 'Device not found' }, 404)
    }

    if (device.oneTimePreKeys.length === 1) {
        await prisma.oneTimePreKey.delete({
            where: {
                id: device.oneTimePreKeys[0].id
            }
        })
    }

    return c.json({ device: publicDeviceTransformer(device) }, 200)
})


// use userid so users can change their username
const zGetDevicesUsernameSchema = z.object({
    userId: zCuidValidator,
})

deviceController.get('/ids', zValidator('query', zGetDevicesUsernameSchema), async (c) => {
    const data = c.req.valid('query')

    const devices = await prisma.device.findMany({
        where: {
            user: {
                id: data.userId
            }
        }
    })

    return c.json({ ids: devices.map(d => d.id) }, 200)
})

const zGetDeviceSchema = z.object({
    deviceId: zCuidValidator
})

deviceController.get('/public/:deviceId', zValidator('param', zGetDeviceSchema), async (c) => {
    const { deviceId } = c.req.valid('param')

    const device = await prisma.device.findUnique({
        where: {
            id: deviceId
        },
        include: {
            user: true,
            identityKey: true,
            signedPreKey: true,
        }
    })

    if (!device) {
        return c.json({ message: 'Device not found' }, 404)
    }

    return c.json({ device: publicDeviceTransformer(device) }, 200)
})
