const keys = ['DB_URL', 'ENVIRONMENT', 'JWT_SECRET']

interface IENV {
    DB_URL: string
    ENVIRONMENT: 'development' | 'staging' | 'production' | 'test'
    JWT_SECRET: string
}

function env(): IENV {
    for (const key of keys) {
        if (key === 'ENVIRONMENT') {
            continue
        }
        if (process.env[key] === undefined) {
            throw new Error(`Environment variable ${key} is undefined`)
        }
    }
    if (
        process.env.ENVIRONMENT !== 'test' &&
        process.env.ENVIRONMENT !== 'staging' &&
        process.env.ENVIRONMENT !== 'development' &&
        process.env.ENVIRONMENT !== 'production'
    ) {
        throw new Error(`Environment variable ENVIRONMENT is not valid`)
    }
    return {
        DB_URL: process.env.DB_URL as string,
        ENVIRONMENT: process.env.ENVIRONMENT as
            | 'development'
            | 'production'
            | 'staging'
            | 'test',
        JWT_SECRET: process.env.JWT_SECRET as string,
    }
}

export const ENV = env()
