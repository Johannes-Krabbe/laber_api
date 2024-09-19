import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../../prisma/client'
import { z } from 'zod'
import { authMiddleware } from '../middlewares/auth.middleware'
import { createDevice } from '../services/device.service'
import {
    privateDeviceTransformer,
    publicDeviceTransformer,
} from '../transformers/device.transformer'
import { zCuidValidator } from '../validators/general.validators'
import {
    zEd25519KeyValidator,
    zX25519KeyValidator,
} from '../validators/key.validator'
import { THROW_ERROR } from '../types/error.type'

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

deviceController.post(
    '/',
    authMiddleware,
    zValidator('json', zCreateDeviceSchema),
    async (c) => {
        const user = c.var.auth.user
        const data = c.req.valid('json')
        const createDeviceData = await createDevice({ ...data, user })

        return c.json(
            {
                device: privateDeviceTransformer({
                    ...createDeviceData.device,
                    signedPreKey: createDeviceData.signedPreKey,
                    oneTimePreKeys: createDeviceData.oneTimePreKeys,
                }),
            },
            201
        )
    }
)

deviceController.get('/all', authMiddleware, async (c) => {
    const devices = await prisma.device.findMany({
        where: {
            userId: c.var.auth.user.id,
        },
        include: {
            signedPreKey: true,
            oneTimePreKeys: true,
        },
    })

    return c.json(
        { devices: devices.map((d) => privateDeviceTransformer(d)) },
        200
    )
})

const zGetDeviceKeyBundleSchema = z.object({
    deviceId: zCuidValidator,
})

deviceController.get(
    '/key-bundle',
    zValidator('query', zGetDeviceKeyBundleSchema),
    async (c) => {
        // TODO - Implement rate limiting
        // users can only request keybundle for devices 3 times per month per user device

        const data = c.req.valid('query')

        const device = await prisma.device.findUnique({
            where: {
                id: data.deviceId,
            },
            include: {
                signedPreKey: true,
                oneTimePreKeys: {
                    take: 1,
                },
                identityKey: true,
            },
        })

        if (!device) {
            return THROW_ERROR.DEVICE_NOT_FOUND('err0006')
        }

        if (device.oneTimePreKeys.length === 1) {
            await prisma.oneTimePreKey.delete({
                where: {
                    id: device.oneTimePreKeys[0].id,
                },
            })
        }

        return c.json({ device: publicDeviceTransformer(device) }, 200)
    }
)

// use userid so users can change their username
const zGetDevicesUsernameSchema = z.object({
    userId: zCuidValidator,
})

deviceController.get(
    '/ids',
    zValidator('query', zGetDevicesUsernameSchema),
    async (c) => {
        const data = c.req.valid('query')

        const devices = await prisma.device.findMany({
            where: {
                user: {
                    id: data.userId,
                },
            },
        })

        return c.json({ ids: devices.map((d) => d.id) }, 200)
    }
)

const zGetDeviceSchema = z.object({
    deviceId: zCuidValidator,
})

deviceController.get(
    '/public/:deviceId',
    zValidator('param', zGetDeviceSchema),
    async (c) => {
        const { deviceId } = c.req.valid('param')

        const device = await prisma.device.findUnique({
            where: {
                id: deviceId,
            },
            include: {
                user: true,
                identityKey: true,
                signedPreKey: true,
            },
        })

        if (!device) {
            return THROW_ERROR.DEVICE_NOT_FOUND('err0007')
        }

        return c.json({ device: publicDeviceTransformer(device) }, 200)
    }
)
