import Bottle from '#models/bottle'
import type { HttpContext } from '@adonisjs/core/http'

export default class BottlesController {
    public async index() {
        return Bottle.query().orderBy('created_at', 'desc').limit(15)
    }

    public async store({ request }: HttpContext) {
        const bottleToCreate = request.only(['message', 'x', 'y'])
        return Bottle.create(bottleToCreate)
    }
}