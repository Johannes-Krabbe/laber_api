import { User } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { sendSMS } from './sms.service'
import { ENV } from '../env'
import { THROW_ERROR } from '../types/error.type'

export async function loginUser(data: {
    phoneNumber: string
}): Promise<{ status: 200 | 201 }> {
    const user = await prisma.user.findUnique({
        where: {
            phoneNumber: data.phoneNumber,
        },
    })

    if (!user) {
        const newUser = await prisma.user.create({
            data: {
                phoneNumber: data.phoneNumber,
                phoneNumberHash: new Bun.CryptoHasher('sha256')
                    .update(data.phoneNumber)
                    .digest('base64'),
            },
        })
        await sendOTP(newUser)

        return {
            status: 201,
        }
    } else {
        await sendOTP(user)
        return {
            status: 200,
        }
    }
}

export async function updateUser(
    userId: string,
    data: {
        username?: string
        name?: string
        phoneNumber?: string
        phoneNumberDiscoveryEnabled?: boolean
        usernameDiscoveryEnabled?: boolean
    }
): Promise<{ user: User }> {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    })

    if (!user) {
        return THROW_ERROR.USER_NOT_FOUND('err0001')
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data,
    })

    return { user: updatedUser }
}

export async function verifyOtp(data: {
    phoneNumber: string
    otp: string
}): Promise<{ user: User }> {
    const user = await prisma.user.findUnique({
        where: {
            phoneNumber: data.phoneNumber,
        },
    })

    if (!user) {
        return THROW_ERROR.USER_NOT_FOUND('err0002')
    }

    const otp = await prisma.otp.findFirst({
        where: {
            userId: user.id,
            code: data.otp,
        },
    })

    if (!otp) {
        return THROW_ERROR.INVALID_OTP('err0003')
    }

    const tenMinutesInMs = 10 * 60 * 1000

    if (otp.createdAt.getTime() + tenMinutesInMs < Date.now()) {
        return THROW_ERROR.OTP_EXPIRED('err0004')
    }

    await prisma.otp.delete({
        where: {
            id: otp.id,
        },
    })

    return { user }
}

async function sendOTP(user: User) {
    const code =
        ENV.NODE_ENV === 'development'
            ? '111111'
            : Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.otp.deleteMany({
        where: {
            code,
            userId: user.id,
        },
    })

    await prisma.otp.create({
        data: {
            code,
            userId: user.id,
        },
    })

    const oneHourInMs = 60 * 60 * 1000

    if (
        (await prisma.otp.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - oneHourInMs),
                },
            },
        })) > 50
    ) {
        // TODO: send warning to admin!
        console.log(
            'Too many OTPs sent in the last hour, that were not verified!'
        )
    } else {
        await sendSMS({
            phoneNumber: user.phoneNumber,
            message: `Your Laber code is ${code}`,
        })
    }
}
