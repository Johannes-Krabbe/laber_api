import z from 'zod'

export const zUsernameValidator = z
    .string()
    .max(16, 'Username is too long (max 16 characters)')
    .min(4, 'Username is too short (min 4 characters)')
    .regex(
        /^[a-z0-9_]*$/,
        'Username can only contain lowercase letters, numbers and underscores'
    )

export const zNameValidator = z
    .string()
    .max(32, 'Name is too long (max 32 characters)')
    .min(1, 'Name is too short (min 1 character)')

export const zPhoneNumberValidator = z
    .string()
    .startsWith('+49', 'We only support German phone numbers')
    .transform((val) => {
        const phoneRegex = /^\+(\d{1,3})(\d+)$/

        const cleanedNumber = val.replace(/\s/g, '')
        const match = cleanedNumber.match(phoneRegex)

        if (match) {
            return cleanedNumber
        }
        return z.NEVER
    })
