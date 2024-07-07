import { x25519 } from '@noble/curves/ed25519';
import { uint8ArrayToBase64 } from './encode.util';

export class X25519Key {
    private privateKey: Uint8Array
    private publicKey: Uint8Array
    constructor(privateKey?: Uint8Array) {
        if (privateKey) {
            this.privateKey = privateKey
        } else {
            this.privateKey = x25519.utils.randomPrivateKey()
        }

        this.publicKey = x25519.getPublicKey(this.privateKey)
    }

    public getPublicKey() {
        return this.publicKey
    }

    public getPublicKeyString() {
        return uint8ArrayToBase64(this.publicKey)
    }

    public getPrivateKey() {
        return this.privateKey
    }

    public getPrivateKeyString() {
        return uint8ArrayToBase64(this.privateKey)
    }
}

export function isValidX25519KeyString(base64String: string): boolean {
    try {
        const keyBuffer = Buffer.from(base64String, 'base64');

        // x25519 keys are 32 bytes long
        if (keyBuffer.length !== 32) {
            return false;
        }

        // Perform additional validation if needed (e.g., using a cryptographic library)
        return true;
    } catch (error) {
        return false;
    }
}
