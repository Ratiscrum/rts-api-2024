import type { HttpContext } from '@adonisjs/core/http'
import User from "#models/user";
import { loginValidator, registerValidator } from "#validators/auth";


export default class AuthController {

    async register({ request, response }: HttpContext) {
        const payload = await request.validateUsing(registerValidator)  
    
        const user = await User.create(payload)

        return response.created(user)
    }
    
    async login({ request, response }: HttpContext) {
        const payload = await request.validateUsing(loginValidator)

        const user = await User.verifyCredentials(payload.email, payload.password)
        const token = await User.accessTokens.create(user)

        return response.ok({ user, token })
    }
}