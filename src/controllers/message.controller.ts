import { Hono } from 'hono'
import { authMiddleware } from '../middlewares/auth.middleware'
import { z } from 'zod'
import { zCuidValidator } from '../validators/general.validators'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../../prisma/client'
import { privateMessageTransformer } from '../transformers/message.transformer'
import { THROW_ERROR } from '../types/error.type'

export const messageController = new Hono()

const zGetNewMessagesSchema = z.object({
    deviceId: zCuidValidator,
})

messageController.get(
    '/new/:deviceId',
    authMiddleware,
    zValidator('param', zGetNewMessagesSchema),
    async (c) => {
        const { user } = c.var.auth
        const { deviceId } = c.req.valid('param')

        const mailbox = await prisma.mailbox.findUnique({
            where: {
                deviceId,
            },
            include: {
                device: true,
                messages: {
                    include: {
                        senderDevice: true,
                    },
                },
            },
        })

        if (!mailbox) {
            return THROW_ERROR.MAILBOX_NOT_FOUND('err0008')
        }

        if (mailbox.device.userId !== user.id) {
            return THROW_ERROR.UNAUTHORIZED('err0009')
        }

        const messages = mailbox.messages

        await prisma.message.deleteMany({
            where: {
                id: {
                    in: messages.map((m) => m.id),
                },
            },
        })

        return c.json({
            messages: mailbox.messages.map((m) =>
                privateMessageTransformer(m, m.senderDevice.userId)
            ),
        })
    }
)

const zPostNewMessageBodySchema = z.object({
    content: z.string().min(1),

    senderDeviceId: zCuidValidator,
    recipientDeviceId: zCuidValidator,
})

messageController.post(
    '/new',
    authMiddleware,
    zValidator('json', zPostNewMessageBodySchema),
    async (c) => {
        const { user } = c.var.auth
        const data = c.req.valid('json')

        const senderDevice = await prisma.device.findUnique({
            where: {
                id: data.senderDeviceId,
            },
            include: {
                user: true,
            },
        })

        if (!senderDevice || senderDevice.userId !== user.id) {
            return THROW_ERROR.UNAUTHORIZED('err0010')
        }

        const recipientMailbox = await prisma.mailbox.findUnique({
            where: {
                deviceId: data.recipientDeviceId,
            },
            include: {
                device: true,
            },
        })

        if (!recipientMailbox) {
            return THROW_ERROR.MAILBOX_NOT_FOUND('err0011')
        }

        const message = await prisma.message.create({
            data: {
                senderDeviceId: data.senderDeviceId,
                mailboxId: recipientMailbox.id,
                content: data.content,
            },
        })

        return c.json(
            { message: privateMessageTransformer(message, user.id) },
            201
        )
    }
)
