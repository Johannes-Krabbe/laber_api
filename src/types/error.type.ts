import { StatusCode } from 'hono/utils/http-status'

interface PublicJsonError {
    message: string
    code: string
}

export class ApplicationError extends Error {
    public error: PublicJsonError
    public httpStatus: StatusCode

    constructor(httpStatus: StatusCode, error: PublicJsonError) {
        super(error.message)
        this.httpStatus = httpStatus
        this.error = error
    }
}
