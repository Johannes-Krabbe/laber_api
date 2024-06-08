import { Hono } from 'hono'
import { indexController } from './controllers/index.controller'

const router = new Hono()

router.route('/', indexController)

export default router
