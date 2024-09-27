import { Prisma, Device } from '@prisma/client'
import {
    identityKeyTransformer,
    oneTimePreKeyTransformer,
    signedPreKeyTransformer,
} from './key.transformer'

type DeviceWithRelations = Prisma.DeviceGetPayload<{
    include: {
        user: true
        oneTimePreKeys: true
        signedPreKey: true
        identityKey: true
    }
}>

export function privateDeviceTransformer(device: DeviceWithRelations | Device) {
    return {
        id: device.id,
        deviceName: device.name,
        unixCreatedAt: device.createdAt.getTime(),
        signedPreKey:
            'signedPreKey' in device
                ? signedPreKeyTransformer(device.signedPreKey)
                : null,
        oneTimePreKeys:
            'oneTimePreKeys' in device
                ? device.oneTimePreKeys.map(oneTimePreKeyTransformer)
                : null,
    }
}

export function publicDeviceTransformer(device: DeviceWithRelations | Device) {
    if ('oneTimePreKeys' in device && device.oneTimePreKeys.length > 1) {
        throw new Error('Internal Server Error (code: trd_1)')
    }

    return {
        id: device.id,
        signedPreKey:
            'signedPreKey' in device
                ? signedPreKeyTransformer(device.signedPreKey)
                : null,
        oneTimePreKey:
            'oneTimePreKeys' in device
                ? oneTimePreKeyTransformer(device.oneTimePreKeys[0])
                : null,
        identityKey:
            'identityKey' in device
                ? identityKeyTransformer(device.identityKey)
                : null,
    }
}
