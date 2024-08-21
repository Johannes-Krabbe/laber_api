import z from 'zod'

export const zCuidValidator = z.string().cuid()
