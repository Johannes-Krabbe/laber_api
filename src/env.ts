const keys = ['DB_URL', 'NODE_ENV', 'JWT_SECRET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'SEND_SMS']

interface IENV {
    DB_URL: string
    NODE_ENV: 'development' | 'staging' | 'production' | 'test'
    JWT_SECRET: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_REGION: string
    SEND_SMS: boolean
}

function env(): IENV {
    for (const key of keys) {
        if (['NODE_ENV', 'SEND_SMS'].includes(key)) {
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

    if (process.env.SEND_SMS && process.env.SEND_SMS !== 'true' && process.env.SEND_SMS !== 'false') {
        throw new Error(`Environment variable SEND_SMS is not valid`)
    }
    let SEND_SMS = false
    if (process.env.SEND_SMS === 'true') {
        SEND_SMS = true
    }

    return {
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as
            | 'development'
            | 'production'
            | 'staging'
            | 'test',
        JWT_SECRET: process.env.JWT_SECRET as string,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
        AWS_REGION: process.env.AWS_REGION as string,
        SEND_SMS,
    }
}

export const ENV = env()
