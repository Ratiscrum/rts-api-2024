import twoFactorAuth from '@nulix/adonis-2fa/services/main'
import type { HttpContext } from '@adonisjs/core/http'

import { verifyOtpValidator } from '#validators/verify_otp'

export default class TwoFactorAuthController {
  async generate({ auth }: HttpContext) {
    const user = auth.user!

    const secret = twoFactorAuth.generateSecret(user.email)

    user.twoFactorSecret = secret.secret
    user.isTwoFactorEnabled = false

    await user.save()

    return secret
  }

  async disable({ auth, response }: HttpContext) {
    if (!auth.user!.isTwoFactorEnabled) {
      return response.badRequest({ message: 'User without 2FA active' })
    }

    await auth
      .user!.merge({ isTwoFactorEnabled: false, twoFactorRecoveryCodes: [], twoFactorSecret: null })
      .save()

    return response.noContent()
  }

  async verify({ auth, request, response }: HttpContext) {
    const { otp } = await request.validateUsing(verifyOtpValidator)

    const user = auth.user!

    const isValid = twoFactorAuth.verifyToken(
      user.twoFactorSecret,
      otp,
      user.twoFactorRecoveryCodes
    )

    if (!isValid) {
      return response.badRequest({ message: 'OTP invalid' })
    }

    if (!user.isTwoFactorEnabled) {
      await user.merge({ isTwoFactorEnabled: true }).save()
    }

    return response.ok({ message: 'OTP valid' })
  }

  async generateRecoveryCodes({ auth, response }: HttpContext) {
    const user = auth.user!

    if (!user.isTwoFactorEnabled) {
      return response.badRequest({ message: 'User without 2FA active' })
    }

    if(user.twoFactorRecoveryCodes && user.twoFactorRecoveryCodes.length > 0) {
      return response.badRequest({ message: 'Recovery codes already generated' })
    }

    const recoveryCodes = twoFactorAuth.generateRecoveryCodes()

    await user.merge({ twoFactorRecoveryCodes: recoveryCodes }).save()

    return { recovery_codes: recoveryCodes }
  }
}