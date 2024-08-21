import { IdentityKey, OneTimePreKey, SignedPreKey } from "@prisma/client";


export function signedPreKeyTransformer(key: SignedPreKey) {
    return { ...abstractKeyTransformer(key), signature: key.signature }
}

export function oneTimePreKeyTransformer(key: OneTimePreKey) {
    return abstractKeyTransformer(key)
}

export function identityKeyTransformer(key: IdentityKey) {
    return abstractKeyTransformer(key)
}

function abstractKeyTransformer(key: SignedPreKey | OneTimePreKey | IdentityKey) {
    return {
        id: key.id,
        unixCreatedAt: key.createdAt.getTime(),
        key: key.key,
    }
}
