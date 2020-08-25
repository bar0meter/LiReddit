import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql'
import { getConnection } from 'typeorm'
import argon2 from 'argon2'
import { v4 } from 'uuid'

import { User } from '../entities/User'
import { MyContext } from '../types'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import UserInput from './UserInput'
import { validateRegister } from '../utils/validateRegister'
import { sendEmail } from '../utils/sendEmail'

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null
    }

    return User.findOne(req.session.userId)
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => UserInput) options: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options)

    if (errors.length > 0) {
      return {
        errors,
      }
    }

    const hashedPassword = await argon2.hash(options.password)

    let user
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning('*')
        .execute()

      user = result.raw[0]
    } catch (err) {
      if (err.code === '23505' || err.detail?.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: `username ${options.username} already exists`,
            },
          ],
        }
      }
    }

    req.session!.userId = user.id

    return {
      user,
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    )

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "username/email doesn't exists",
          },
        ],
      }
    }

    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      }
    }

    req.session.userId = user.id

    return {
      user,
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME)
        if (err) {
          console.error(err)
          resolve(false)
          return
        }

        resolve(true)
      })
    )
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      // email not in database
      return true
    }

    const token = v4()

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 86400 // 1 day
    )

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    )

    return true
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('newPassword') newPassword: string,
    @Arg('token') token: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'new password length must be greater than 2',
          },
        ],
      }
    }

    // token expired / invalid
    const key = FORGET_PASSWORD_PREFIX + token
    const userId = await redis.get(key)
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'invalid token',
          },
        ],
      }
    }

    // user not found
    const userIdNum = parseInt(userId, 10)
    const user = await User.findOne(userIdNum)
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'invalid token',
          },
        ],
      }
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    )

    // delete key after new password has been saved
    await redis.del(key)

    // log in after password change
    req.session.userId = user.id

    return {
      user,
    }
  }
}
