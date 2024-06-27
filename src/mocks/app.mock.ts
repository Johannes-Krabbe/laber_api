import app from '../../src/app'

export class AppMock {
    public async get(path: string, options?: RequestOptions) {
        return await this.request(path, 'GET', options)
    }

    public async post(path: string, options?: RequestOptions) {
        return await this.request(path, 'POST', options)
    }

    public async put(path: string, options?: RequestOptions) {
        return await this.request(path, 'PUT', options)
    }

    public async delete(path: string, options?: RequestOptions) {
        return await this.request(path, 'DELETE', options)
    }

    private async request(
        path: string,
        method: string,
        options?: RequestOptions
    ) {
        const res = await app.request(path, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(options?.body),
            cache: 'no-cache',
        })

        // eslint-disable-next-line
        let body: any
        try {
            body = await res?.json()
        } catch (e) {
            body = undefined
        }

        return {
            status: res.status,
            headers: res.headers,
            body,
        }
    }
}

interface RequestOptions {
    headers?: HeadersInit
    body?: unknown
}
export const appMock = new AppMock()
