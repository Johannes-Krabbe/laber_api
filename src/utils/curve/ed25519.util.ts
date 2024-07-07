import { Hex } from '@noble/curves/abstract/utils';
import { ed25519 } from '@noble/curves/ed25519';
import { uint8ArrayToBase64 } from './encode.util';

export class Ed25519Key {
    private privateKey: Uint8Array
    private publicKey: Uint8Array
    constructor(privateKey?: Uint8Array) {
        if (privateKey) {
            this.privateKey = privateKey
        } else {
            this.privateKey = ed25519.utils.randomPrivateKey()
        }

        this.publicKey = ed25519.getPublicKey(this.privateKey)
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

    public sign(data: Hex) {
        return ed25519.sign(data, this.privateKey)
    }
}


export function isValidEd25519KeyString(base64String: string): boolean {
    try {
        const keyBuffer = Buffer.from(base64String, 'base64');

        // ed25519 keys are 32 bytes long for private keys and 32 bytes long for public keys
        if (keyBuffer.length !== 32) {
            return false;
        }

        // Perform additional validation if needed (e.g., using a cryptographic library)
        return true;
    } catch (error) {
        return false;
    }
}
