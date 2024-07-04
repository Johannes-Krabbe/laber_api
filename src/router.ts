import { Hono } from 'hono'
import { indexController } from './controllers/index.controller'
import { authController } from './controllers/auth.controller'
import { deviceController } from './controllers/device.controller'

const router = new Hono()

router.route('/', indexController)
router.route('/auth', authController)
router.route('/device', deviceController)

export default router
