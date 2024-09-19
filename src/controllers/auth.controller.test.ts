import { prisma } from '../../prisma/client'
import { test, expect, describe, beforeEach } from 'bun:test'
import { appMock } from '../mocks/app.mock'

describe('Auth Controller', () => {
    beforeEach(async () => {
        // @ts-expect-error reset is not in normal prisma client type
        prisma.reset()
    })

    /*
    ======================
    ====== REGISTER ======
    ======================
    */

    test('POST /auth/login => register (happy path)', async () => {
        const userdata = {
            phoneNumber: '+49234567890',
        }

        let res = await appMock.post('/auth/login', {
            body: userdata,
        })

        expect(res.status).toBe(201)
        expect(res.body.user).toBeUndefined()
        expect(res.body.token).toBeUndefined()
        expect(res.body.message).toBeDefined()

        const user = await prisma.user.findFirst({
            where: {
                phoneNumber: userdata.phoneNumber,
            },
        })

        expect(user).toBeDefined()
        if (!user) throw new Error('user not found')
        expect(user.phoneNumber).toBe(userdata.phoneNumber)
        expect(user.onboardingCompleted).toBeFalse()
        expect(user.id).toBeDefined()
        expect(user.createdAt).toBeDefined()
        expect(user.updatedAt).toBeDefined()
        expect(user.profilePicture).toBeNull()

        const otp = await prisma.otp.findFirst({
            where: {
                userId: user.id,
            },
        })

        expect(otp).toBeDefined()
        if (!otp) throw new Error('otp not found')
        expect(otp.code).toBeDefined()
        expect(otp.userId).toBe(user.id)
        expect(otp.code.length).toBe(6)

        res = await appMock.post('/auth/verify', {
            body: {
                phoneNumber: userdata.phoneNumber,
                otp: otp.code,
            },
        })

        expect(res.status).toBe(200)
        expect(res.body.token).toBeDefined()
        expect(res.body.user).toBeDefined()
        expect(res.body.user.id).toBeDefined()
        expect(res.body.user.onboardingCompleted).toBeFalse()
        expect(res.body.user.phoneNumber).toBe(userdata.phoneNumber)
    })

    test('POST /auth/login => register (ill formated phoneNumber)', async () => {
        let res = await appMock.post('/auth/login', {
            body: {
                phoenNumber: 'alskdfe',
            },
        })

        expect(res.status).toBe(400)

        res = await appMock.post('/auth/login', {
            body: {
                phoneNumber: '123456789',
            },
        })

        expect(res.status).toBe(400)

        res = await appMock.post('/auth/login', {
            body: {
                nothing: 'test',
            },
        })

        expect(res.status).toBe(400)
    })

    /*
    =====================
    ======= LOGIN =======
    =====================
    */

    test('POST /auth/login => login (happy path)', async () => {
        const userdata = {
            phoneNumber: '+49234567890',
        }

        // create user
        let res = await appMock.post('/auth/login', {
            body: userdata,
        })

        // login
        res = await appMock.post('/auth/login', {
            body: userdata,
        })

        expect(res.status).toBe(200)
        expect(res.body.user).toBeUndefined()
        expect(res.body.token).toBeUndefined()
        expect(res.body.message).toBeDefined()

        const user = await prisma.user.findFirst({
            where: {
                phoneNumber: userdata.phoneNumber,
            },
        })

        if (!user) throw new Error('user not found')

        const otp = await prisma.otp.findFirst({
            where: {
                userId: user.id,
            },
        })

        expect(otp).toBeDefined()
        if (!otp) throw new Error('otp not found')
        expect(otp.code).toBeDefined()
        expect(otp.userId).toBe(user.id)
        expect(otp.code.length).toBe(6)

        res = await appMock.post('/auth/verify', {
            body: {
                phoneNumber: userdata.phoneNumber,
                otp: otp.code,
            },
        })

        expect(res.status).toBe(200)
        expect(res.body.token).toBeDefined()
        expect(res.body.user).toBeDefined()
        expect(res.body.user.id).toBeDefined()
        expect(res.body.user.onboardingCompleted).toBeFalse()
        expect(res.body.user.phoneNumber).toBe(userdata.phoneNumber)
    })

    test('POST /auth/login => login (wrong otp)', async () => {
        const userdata = {
            phoneNumber: '+49234567890',
        }

        // create user
        let res = await appMock.post('/auth/login', {
            body: userdata,
        })

        // login
        res = await appMock.post('/auth/login', {
            body: userdata,
        })

        expect(res.status).toBe(200)
        expect(res.body.user).toBeUndefined()
        expect(res.body.token).toBeUndefined()
        expect(res.body.message).toBeDefined()

        const user = await prisma.user.findFirst({
            where: {
                phoneNumber: userdata.phoneNumber,
            },
        })

        if (!user) throw new Error('user not found')

        const otp = await prisma.otp.findFirst({
            where: {
                userId: user.id,
            },
        })

        expect(otp).toBeDefined()
        if (!otp) throw new Error('otp not found')
        expect(otp.code).toBeDefined()
        expect(otp.userId).toBe(user.id)
        expect(otp.code.length).toBe(6)

        res = await appMock.post('/auth/verify', {
            body: {
                phoneNumber: userdata.phoneNumber,
                // make sure the otp is wrong
                otp: otp.code === '123456' ? '654321' : '123456',
            },
        })

        expect(res.status).toBe(400)
    })

    /*
    ==================
    ======= ME =======
    ==================
    */

    test('GET /auth/me => me (happy path)', async () => {
        const userdata = {
            phoneNumber: '+49234567890',
        }

        // create user
        await appMock.post('/auth/login', {
            body: userdata,
        })

        const otp = await prisma.otp.findFirst({
            where: {
                user: {
                    phoneNumber: userdata.phoneNumber,
                },
            },
        })

        if (!otp) throw new Error('otp not found')

        const verifyRes = await appMock.post('/auth/verify', {
            body: {
                phoneNumber: userdata.phoneNumber,
                // make sure the otp is wrong
                otp: otp.code,
            },
        })

        const meRes = await appMock.get('/auth/me', {
            headers: {
                Authorization: `${verifyRes.body.token}`,
            },
        })

        expect(meRes.status).toBe(200)
        expect(meRes.body.user).toBeDefined()
        expect(meRes.body.user.id).toBeDefined()
        expect(meRes.body.user.phoneNumber).toBe(userdata.phoneNumber)
    })
})
