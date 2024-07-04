import { Hex } from '@noble/curves/abstract/utils';
import { ed25519 } from '@noble/curves/ed25519';
import { uint8ArrayToBase64 } from './encode.util';

export class X25519Key {
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

export function validateX25519KeyString(keyString: string) {
    // Validate if the string is a valid base64
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(keyString)) {
        return false;
    }

    // Decode the base64 string to a byte array
    const binaryString = atob(keyString);
    const byteLength = binaryString.length;

    // X25519 key should be 32 bytes
    return byteLength === 32;
}
