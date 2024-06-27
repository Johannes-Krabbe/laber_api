import { Hono } from 'hono'

export const indexController = new Hono()

indexController.get('/', (c) =>
    c.json({ message: 'Welcome to the Laber API!' })
)
