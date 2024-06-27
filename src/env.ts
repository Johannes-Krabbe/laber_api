const keys = ['DB_URL', 'NODE_ENV', 'JWT_SECRET']

interface IENV {
    DB_URL: string
    NODE_ENV: 'development' | 'staging' | 'production' | 'test'
    JWT_SECRET: string
}

function env(): IENV {
    for (const key of keys) {
        if (key === 'NODE_ENV') {
            continue
        }
        if (process.env[key] === undefined) {
            throw new Error(`Environment variable ${key} is undefined`)
        }
    }
    if (
        process.env.NODE_ENV !== 'test' &&
        process.env.NODE_ENV !== 'staging' &&
        process.env.NODE_ENV !== 'development' &&
        process.env.NODE_ENV !== 'production'
    ) {
        throw new Error(`Environment variable NODE_ENV is not valid`)
    }
    return {
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as
            | 'development'
            | 'production'
            | 'staging'
            | 'test',
        JWT_SECRET: process.env.JWT_SECRET as string,
    }
}

export const ENV = env()
