import { test, expect, describe } from 'bun:test'
import { X25519Key, validateX25519KeyString } from './x25519.util'
import { ed25519 } from '@noble/curves/ed25519'
import { base64ToUint8Array, uint8ArrayToBase64 } from './encode.util'
describe('X25519 Util', () => {
    test('generateX25519KeyPair', async () => {
        const key = new X25519Key()
        expect(key.getPrivateKey().length).toBe(32)
        expect(key.getPublicKey().length).toBe(32)
        expect(key.getPrivateKeyString()).toBeString()
        expect(key.getPublicKeyString()).toBeString()
    })

    test('signing', async () => {
        const key = new X25519Key()

        const data = new TextEncoder().encode('test data')
        const signature = key.sign(data)

        expect(signature.length).toBe(64)

        const publicKey = key.getPublicKey()
        const verified = ed25519.verify(signature, data, publicKey)
        expect(verified).toBeTrue()
    })

    test('validate', async () => {
        const key = new X25519Key()
        const valid = validateX25519KeyString(key.getPublicKeyString())
        expect(valid).toBeTrue()
    })

    test('sache', async () => {
        const key = new X25519Key();

        console.log(key.getPrivateKey());
        console.log(base64ToUint8Array(uint8ArrayToBase64(key.getPrivateKey())));

        expect(key.getPrivateKey().length).toBe(base64ToUint8Array(uint8ArrayToBase64(key.getPrivateKey())).length);
    });

})
