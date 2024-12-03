import type { HttpContext } from '@adonisjs/core/http'
import User from "#models/user";
import { loginValidator, registerValidator } from "#validators/auth";
import { verifyOtpValidator } from '#validators/verify_otp';
import twoFactorAuth from '@nulix/adonis-2fa/services/main';


export default class AuthController {

    async register({ request, response }: HttpContext) {
        const payload = await request.validateUsing(registerValidator)  
    
        const user = await User.create(payload)

        return response.created(user)
    }
    
    async login({ request, response }: HttpContext) {
        const payload = await request.validateUsing(loginValidator)

        const user = await User.verifyCredentials(payload.email, payload.password)

        if(!user) {
            return response.badRequest({ message: 'Invalid credentials' })
        }

        if(user.isTwoFactorEnabled) {
          const payloadWithOTP = await request.validateUsing(loginValidator && verifyOtpValidator)

          const isValid = twoFactorAuth.verifyToken(
            user.twoFactorSecret,
            payloadWithOTP.otp,
            user.twoFactorRecoveryCodes
          )

          if (!isValid) {
            return response.badRequest({ message: 'OTP invalid' })
          }
        }

        const token = await User.accessTokens.create(user)

        return response.ok({ user, token })
    }

    async logout({ auth, response }: HttpContext) {
        const user = auth.getUserOrFail()
        const token = auth.user?.currentAccessToken.identifier

        if (!token) {
          return response.badRequest({ message: 'Token not found' })
        }

        await User.accessTokens.delete(user, token)
        
        return response.ok({ message: 'Logged out' })
      }
}