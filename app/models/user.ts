import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import encryption from '@adonisjs/core/services/encryption'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column({
    serializeAs: null,
    consume: (value: string) => (value ? JSON.parse(encryption.decrypt(value) ?? '{}') : null),
    prepare: (value: string) => encryption.encrypt(JSON.stringify(value)),
  })
  declare twoFactorSecret?: string
 
  @column({
    serializeAs: null,
    consume: (value: string) => (value ? JSON.parse(encryption.decrypt(value) ?? '[]') : []),
    prepare: (value: string[]) => encryption.encrypt(JSON.stringify(value)),
  })
  declare twoFactorRecoveryCodes?: string[]

  @column()
  declare isTwoFactorEnabled: boolean
 

  static accessTokens = DbAccessTokensProvider.forModel(User)
}