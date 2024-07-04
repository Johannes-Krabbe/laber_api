import { OneTimePreKey, SignedPreKey } from "@prisma/client";


export function signedPreKeyTransformer(key: SignedPreKey) {
    return { ...abstractKeyTransformer(key), signature: key.signature }
}

export function oneTimePreKeyTransformer(key: OneTimePreKey) {
    return abstractKeyTransformer(key)
}

function abstractKeyTransformer(key: SignedPreKey | OneTimePreKey | SignedPreKey) {
    return {
        id: key.id,
        createdAt: key.createdAt,
    }
}
