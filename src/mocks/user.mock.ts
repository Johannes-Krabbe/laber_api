import { prisma } from '../../prisma/client'
import { appMock } from './app.mock'

export async function createAndLoginMockUser() {
    const userdata = {
        phoneNumber: '+49123456789',
    }

    await appMock.post('/auth/login', {
        body: userdata,
    })

    const user = await prisma.user.findFirst({
        where: {
            phoneNumber: userdata.phoneNumber,
        },
    })
    if (!user) throw new Error('User not found')

    const otp = await prisma.otp.findFirst({
        where: {
            userId: user.id,
        },
    })

    if (!otp) throw new Error('Otp not found')

    const verifyRes = await appMock.post('/auth/verify', {
        body: {
            phoneNumber: userdata.phoneNumber,
            otp: otp.code,
        },
    })

    return { ...userdata, token: verifyRes.body.token }
}
