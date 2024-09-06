import { Device, IdentityKey, OneTimePreKey, SignedPreKey, User } from "@prisma/client"
import { FunctionReturnType } from "../types/function.type"
import { prisma } from "../../prisma/client"

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
}): Promise<FunctionReturnType<{ device: Device, identityKey: IdentityKey, signedPreKey: SignedPreKey, oneTimePreKeys: OneTimePreKey[] }, 409 | 201>> {

    const existingDevice = await prisma.device.findFirst({
        where: {
            name: data.deviceName,
            userId: data.user.id
        }
    })
    if (existingDevice) {
        return {
            status: 409,
            message: "Device with the same name already exists for the user",
        }
    }

    const identityKey = await prisma.identityKey.create({
        data: {
            key: data.identityKey,
        }
    })

    const signedPreKey = await prisma.signedPreKey.create({
        data: {
            key: data.signedPreKey.key,
            signature: data.signedPreKey.signature,
        }
    })

    const device = await prisma.device.create({
        data: {
            name: data.deviceName,
            userId: data.user.id,
            identityKeyId: identityKey.id,
            signedPreKeyId: signedPreKey.id,
            mailbox: {
                create: {}
            }
        }
    })

    const oneTimePreKeys: OneTimePreKey[] = []
    for (const key of data.oneTimePreKeys) {
        const oneTimePreKey = await prisma.oneTimePreKey.create({
            data: {
                key: key,
                deviceId: device.id
            }
        })
        oneTimePreKeys.push(oneTimePreKey)
    }


    return {
        status: 201,
        message: "Device created successfully",
        data: {
            device,
            identityKey,
            signedPreKey,
            oneTimePreKeys: oneTimePreKeys
        }
    }

}
