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
        expect(res.body.token).toBeDefined()
        expect(res.body.user).toBeDefined()
        expect(res.body.user.id).toBeDefined()
        expect(res.body.user.onboardingCompleted).toBeFalse()
        expect(res.body.user.phoneNumber).toBe(userdata.phoneNumber)

        const otp = await prisma.otp.findFirst({
            where: {
                userId: res.body.user.id,
            }
        })

        expect(otp).toBeDefined()
        if(!otp) throw new Error('otp not found')
        expect(otp.code).toBeDefined()
        expect(otp.userId).toBe(res.body.user.id)
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
        let res = await appMock.post('/auth/register', {
            body: {
                phoenNumber: 'alskdfe',
            },
        })

        expect(res.status).toBe(400)

        res = await appMock.post('/auth/register', {
            body: {
                phoneNumber: '123456789',
            },
        })

        expect(res.status).toBe(400)

        res = await appMock.post('/auth/register', {
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

    // TODO continue writing tests here
    test('POST /auth/login => login (happy path)', async () => {
        await appMock.post('/auth/register', {
            body: {
                username: 'test123',
                password: 'test',
            },
        })

        const res = await appMock.post('/auth/login', {
            body: {
                username: 'test123',
                password: 'test',
            },
        })

        expect(res.status).toBe(200)
        expect(res.body.token).toBeDefined()
        expect(res.body.user).toBeDefined()
        expect(res.body.user.id).toBeDefined()
        expect(res.body.user.username).toBe('test123')
        expect(res.body.user.password).toBeUndefined()
    })

    test('POST /auth/login => login (wrong password)', async () => {
        await appMock.post('/auth/register', {
            body: {
                username: 'test123',
                password: 'test',
            },
        })

        const res = await appMock.post('/auth/login', {
            body: {
                password: 'test1',
            },
        })

        expect(res.status).toBe(400)
    })

    test('POST /auth/login => login (user not found)', async () => {
        const res = await appMock.post('/auth/login', {
            body: {
                username: 'test123',
                password: 'test',
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
        const registerRes = await appMock.post('/auth/register', {
            body: {
                username: 'test123',
                password: 'test',
            },
        })

        let res = await appMock.get('/auth/me', {
            headers: {
                Authorization: `${registerRes.body.token}`,
            },
        })

        expect(res.status).toBe(200)
        expect(res.body.user).toBeDefined()
        expect(res.body.user.id).toBeDefined()
        expect(res.body.user.username).toBe('test123')
        expect(res.body.user.password).toBeUndefined()

        res = await appMock.get('/auth/me', {
            headers: {
                Authorization: `Bearer ${registerRes.body.token}`,
            },
        })

        expect(res.status).toBe(200)
        expect(res.body.user).toBeDefined()
        expect(res.body.user.id).toBeDefined()
        expect(res.body.user.username).toBe('test123')
        expect(res.body.user.password).toBeUndefined()
    })
})
