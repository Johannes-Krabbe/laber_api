import { User } from "@prisma/client";
import { FunctionReturnType } from "../types/function.type";
import { prisma } from "../../prisma/client";
import { sendSMS } from "./sms.service";


export async function loginUser(data: { phoneNumber: string }): Promise<FunctionReturnType<undefined, 400 | 200 | 201>> {
    const user = await prisma.user.findUnique({
        where: {
            phoneNumber: data.phoneNumber
        }
    })

    if (!user) {
        const newUser = await prisma.user.create({
            data: {
                phoneNumber: data.phoneNumber
            }
        })
        await sendOTP(newUser)

        return {
            message: 'User created - send OTP',
            status: 201
        }
    } else {
        await sendOTP(user)
        return {
            message: 'Logged in - send OTP',
            status: 200
        }
    }


}

export async function verifyOtp(data: { phoneNumber: string, otp: string }): Promise<FunctionReturnType<User, 400 | 200>> {
    const user = await prisma.user.findUnique({
        where: {
            phoneNumber: data.phoneNumber
        }
    })

    if (!user) {
        return {
            message: 'User not found',
            status: 400
        }
    }

    const otp = await prisma.otp.findFirst({
        where: {
            userId: user.id,
            code: data.otp
        }
    })

    if (!otp) {
        return {
            message: 'Invalid Code',
            status: 400
        }
    }

    const tenMinutesInMs = 10 * 60 * 1000

    if (otp.createdAt.getTime() + tenMinutesInMs < Date.now()) {
        return {
            message: 'Code expired, try again',
            status: 400
        }
    }

    await prisma.otp.delete({
        where: {
            id: otp.id
        }
    })

    return {
        data: user,
        message: 'OTP verified',
        status: 200
    }
}

async function sendOTP(user: User) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.otp.create({
        data: {
            code,
            userId: user.id
        }
    })

    const oneHourInMs = 60 * 60 * 1000

    if (await prisma.otp.count({
        where: {
            createdAt: {
                gte: new Date(Date.now() - oneHourInMs)
            }
        }
    }) > 50) {
        // TODO: send warning to admin!
        console.log('Too many OTPs sent in the last hour, that were not verified!')
    } else {
        await sendSMS({ phoneNumber: user.phoneNumber, message: `Your Laber code is ${code}` })
    }
}
