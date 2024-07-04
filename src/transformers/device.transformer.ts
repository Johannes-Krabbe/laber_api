import { Prisma, Device } from '@prisma/client'
import { oneTimePreKeyTransformer, signedPreKeyTransformer } from './key.transformer'

type DeviceWithRelations = Prisma.DeviceGetPayload<{
    include: {
        user: true,
        oneTimePreKeys: true,
        signedPreKey: true
    }
}>

export function privateDeviceTransformer(device: DeviceWithRelations | Device) {
    return {
        id: device.id,
        deviceName: device.name,
        signedPreKey: 'signedPreKey' in device ? signedPreKeyTransformer(device.signedPreKey) : null,
        oneTimePreKeys: 'oneTimePreKeys' in device ? device.oneTimePreKeys.map(oneTimePreKeyTransformer) : null,
    }
}

