import { MiddlewareFn } from 'type-graphql/dist/interfaces/Middleware'
import { MyContext } from '../types'

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  console.log(context.req.session)
  if (!context.req.session.userId) {
    throw new Error('not authenticated')
  }

  return next()
}
