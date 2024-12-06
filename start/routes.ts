/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const TwoFactorAuthController = () => import('#controllers/two_factor_auth_controller')
const BottlesController = () => import('#controllers/bottles_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  router.post('register', [AuthController, 'register'])
  router.post('login', [AuthController, 'login'])
  router.post('logout', [AuthController, 'logout']).use(middleware.auth())
}).prefix('user')

router.get('me', async ({ auth, response }) => {
  try {
    const user = auth.getUserOrFail()
    return response.ok(user)
  }
  catch (error) {
    return response.unauthorized({ error: 'User not found' })
  }
}).use(middleware.auth())

router.group(() => {
  router.post('generate', [TwoFactorAuthController, 'generate'])
  router.post('disable', [TwoFactorAuthController, 'disable'])
  router.post('verify', [TwoFactorAuthController, 'verify'])
  router.post('recovery-codes', [TwoFactorAuthController, 'generateRecoveryCodes'])
}).prefix('2fa').use(middleware.auth())

router.group(() => {
  router.get('', [BottlesController, 'index'])
  router.post('', [BottlesController, 'store'])
}).prefix('bottles');