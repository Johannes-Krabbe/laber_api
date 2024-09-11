import { Hono } from 'hono'
import { cors } from 'hono/cors'
import router from './router'
import { ENV } from './env'
import { ApplicationError } from './types/error.type'

// validate env variables
ENV

const app = new Hono()

app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'https://laber.app',
            'https://www.laber.app',
            'https://staging.laber.app',
            'https://www.staging.laber.app',
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
)

app.onError((err, c) => {
    if (err instanceof ApplicationError) {
        return c.json(err.error, err.httpStatus)
    }
    return c.json({ error: err.message }, 500)
})

app.route('', router)
export default app
