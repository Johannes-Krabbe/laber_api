import { z } from 'zod'
import { isValidX25519KeyString } from '../utils/curve/x25519.util'
import { isValidEd25519KeyString } from '../utils/curve/ed25519.util'

export const zKeyBaseValidator = z.string().refine(
    (val) => {
        const json = JSON.parse(val)
        if (json.type && json.publicKey) {
            return true
        }
    },
    { message: 'Invalid key' }
)

export const zX25519KeyValidator = zKeyBaseValidator.refine((val) => {
    const json = JSON.parse(val)
    return isValidX25519KeyString(json.publicKey)
})

export const zEd25519KeyValidator = zKeyBaseValidator.refine((val) => {
    const json = JSON.parse(val)
    return isValidEd25519KeyString(json.publicKey)
})
