import { Hono } from 'hono'

export const deviceController = new Hono()

deviceController.get('/', (c) =>
    c.json({ message: 'Welcome to the Laber API!' })
)
