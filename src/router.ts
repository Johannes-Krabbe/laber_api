import { Hono } from 'hono'
import { indexController } from './controllers/index.controller'
import { authController } from './controllers/auth.controller'

const router = new Hono()

router.route('/', indexController)
router.route('/auth', authController)

export default router
