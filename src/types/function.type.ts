export type FunctionReturnType<T, S = number> = {
    data?: T
    status: S
    message: string
    error?: unknown
}
