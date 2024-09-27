const keys = [
    'DATABASE_URL',
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'SEND_SMS',
]

interface IENV {
    DATABASE_URL: string
    NODE_ENV: 'development' | 'staging' | 'production' | 'test'
    PORT: number
    JWT_SECRET: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_REGION: string
    SEND_SMS: boolean
}

function env(): IENV {
    for (const key of keys) {
        if (['NODE_ENV', 'SEND_SMS', 'PORT'].includes(key)) {
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

    let PORT = 8080

    if (process.env['PORT'] !== undefined && isNaN(parseInt(process.env['PORT'] as string))) {
        throw new Error(`Environment variable PORT is not a number`)
    } else if (process.env['PORT'] !== undefined) {
        PORT = parseInt(process.env['PORT'] as string)
    }


    // Default value for SEND_SMS is true
    let SEND_SMS = true
    if (process.env['SEND_SMS'] === 'false') {
        SEND_SMS = false
    }

    return {
        DATABASE_URL: process.env['DATABASE_URL'] as string,
        NODE_ENV: process.env.NODE_ENV as
            | 'development'
            | 'production'
            | 'staging'
            | 'test',
        PORT: PORT,
        JWT_SECRET: process.env['JWT_SECRET'] as string,
        AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'] as string,
        AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'] as string,
        AWS_REGION: process.env['AWS_REGION'] as string,
        SEND_SMS,
    }
}

export const ENV = env()
