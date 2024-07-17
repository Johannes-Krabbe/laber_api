import { prisma } from '../../prisma/client'
import { test, expect, describe, beforeEach } from 'bun:test'
import { appMock } from '../mocks/app.mock'
import { createAndLoginMockUser } from '../mocks/user.mock'
import { Ed25519Key } from '../utils/curve/ed25519.util'
import { X25519Key } from '../utils/curve/x25519.util'

describe('Device Controller', () => {
    beforeEach(async () => {
        // @ts-expect-error reset is not in normal prisma client type
        prisma.reset()
    })

    test('POST / => createDevice (happy path)', async () => {
        const userdata = await createAndLoginMockUser()

        const identityKeyPair = new Ed25519Key()

        const oneTimePreKeyPairs = await Promise.all(Array.from({ length: 5 }, async () => {
            return new X25519Key()
        }))

        const preKeyPair = new X25519Key()
        const signature = identityKeyPair.sign(preKeyPair.getPublicKey())

        const out = await appMock.post('/device', {
            headers: {
                Authorization: `Bearer ${userdata.token}`,
            },
            body: {
                deviceName: 'testdevice',
                identityKey: identityKeyPair.getPublicKeyString(),
                signedPreKey: {
                    key: preKeyPair.getPublicKeyString(),
                    signature: new TextDecoder().decode(signature),
                },
                oneTimePreKeys: oneTimePreKeyPairs.map((key) => key.getPublicKeyString()),
            }
        })
        console.log(out.body.error)

        expect(out.status).toBe(201)
    })
})
