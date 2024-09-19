import {
    Device,
    IdentityKey,
    OneTimePreKey,
    SignedPreKey,
    User,
} from '@prisma/client'
import { prisma } from '../../prisma/client'
import { THROW_ERROR } from '../types/error.type'

// TODO think of potential errors and handle them
export async function createDevice(data: {
    deviceName: string
    identityKey: string
    signedPreKey: {
        key: string
        signature: string
    }
    oneTimePreKeys: string[]
    user: User
}): Promise<{
    device: Device
    identityKey: IdentityKey
    signedPreKey: SignedPreKey
    oneTimePreKeys: OneTimePreKey[]
}> {
    const existingDevice = await prisma.device.findFirst({
        where: {
            name: data.deviceName,
            userId: data.user.id,
        },
    })
    if (existingDevice) {
        return THROW_ERROR.DEVICE_ALREADY_EXISTS('err0005')
    }

    const identityKey = await prisma.identityKey.create({
        data: {
            key: data.identityKey,
        },
    })

    const signedPreKey = await prisma.signedPreKey.create({
        data: {
            key: data.signedPreKey.key,
            signature: data.signedPreKey.signature,
        },
    })

    const device = await prisma.device.create({
        data: {
            name: data.deviceName,
            userId: data.user.id,
            identityKeyId: identityKey.id,
            signedPreKeyId: signedPreKey.id,
            mailbox: {
                create: {},
            },
        },
    })

    const oneTimePreKeys: OneTimePreKey[] = []
    for (const key of data.oneTimePreKeys) {
        const oneTimePreKey = await prisma.oneTimePreKey.create({
            data: {
                key: key,
                deviceId: device.id,
            },
        })
        oneTimePreKeys.push(oneTimePreKey)
    }

    return {
        device,
        identityKey,
        signedPreKey,
        oneTimePreKeys: oneTimePreKeys,
    }
}
