import { StatusCode } from 'hono/utils/http-status'

interface PublicJsonError {
    code: string
    positionCode: string
}

export class ApplicationError extends Error {
    public error: PublicJsonError
    public httpStatus: StatusCode

    constructor(httpStatus: StatusCode, error: PublicJsonError) {
        super(error.code)
        this.httpStatus = httpStatus
        this.error = error
    }
}

export const THROW_ERROR = {
    // Auth
    USER_NOT_FOUND: (positionCode: string) => {
        throw new ApplicationError(400, {
            code: 'USER_NOT_FOUND',
            positionCode,
        })
    },

    INVALID_OTP: (positionCode: string) => {
        throw new ApplicationError(400, {
            code: 'INVALID_OTP',
            positionCode,
        })
    },

    OTP_EXPIRED: (positionCode: string) => {
        throw new ApplicationError(400, {
            code: 'OTP_EXPIRED',
            positionCode,
        })
    },

    NO_TOKEN_PROVIDED: (positionCode: string) => {
        throw new ApplicationError(401, {
            code: 'NO_TOKEN_PROVIDED',
            positionCode,
        })
    },

    INVALID_TOKEN: (positionCode: string) => {
        throw new ApplicationError(401, {
            code: 'INVALID_TOKEN',
            positionCode,
        })
    },

    USER_ALREADY_DELETED: (positionCode: string) => {
        throw new ApplicationError(400, {
            code: 'USER_ALREADY_DELETED',
            positionCode,
        })
    },

    // Device
    DEVICE_ALREADY_EXISTS: (positionCode: string) => {
        throw new ApplicationError(409, {
            code: 'DEVICE_ALREADY_EXISTS',
            positionCode,
        })
    },

    DEVICE_NOT_FOUND: (positionCode: string) => {
        throw new ApplicationError(404, {
            code: 'DEVICE_NOT_FOUND',
            positionCode,
        })
    },

    // Message
    MAILBOX_NOT_FOUND: (positionCode: string) => {
        throw new ApplicationError(404, {
            code: 'MAILBOX_NOT_FOUND',
            positionCode,
        })
    },

    // General
    UNAUTHORIZED: (positionCode: string) => {
        throw new ApplicationError(401, {
            code: 'UNAUTHORIZED',
            positionCode,
        })
    },
}
