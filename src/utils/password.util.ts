export async function hashPassword(password: string): Promise<string> {
    const argonHash = await Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 4,
        timeCost: 3,
    })

    return argonHash
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return await Bun.password.verify(password, hash)
}
