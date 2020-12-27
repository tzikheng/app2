import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import { MyContext } from 'src/types'
import { User } from '../entities/User'
// import { Session } from 'express-session'
import argon2 from 'argon2'
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { UsernamePasswordInput } from './UsernamePasswordInput'
import { validateRegister } from '../utils/validateRegister'
import { sendEmail } from '../utils/sendEmail'
import { v4 } from 'uuid'

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(()=> User, {nullable: true})
  user?: User
  @Field(()=> [FieldError], {nullable: true})
  errors?: FieldError[] // ? -> undefined
}

@Resolver(User)
export class UserResolver {
  @Mutation(()=> UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx(){redis, em, req}: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2){
      return {
        errors:[
          {
            field: 'newPassword',
            message: 'length must be greater than 2'
          }
        ]
      }
    }
    const key = FORGET_PASSWORD_PREFIX+token
    const userId = await redis.get(key)
    if (!userId){
      return {
        errors:[
          {
            field: 'token',
            message: 'token expired'
          }
        ]
      }
    }
    const user = await em.findOne(User, {id: parseInt(userId)})
    if (!user){
      return {
        errors:[
          {
            field: 'token',
            message: 'token expired'
          }
        ]
      }
    }
    user.password = await argon2.hash(newPassword) // updatedAt auto updated
    await em.persistAndFlush(user)
    await redis.del(key)
    req.session.userId = user.id
    return {user}
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() {em, redis} : MyContext
  ){
    const user = await em.findOne(User, {email})
    if(!user){
      return true
    }
    const token = v4()
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id, 
      'ex', 
      1000*60*60*24*3
    ) // 3 days
    sendEmail(
      email, 
      `<a href='http://localhost:3000/change-password/${token}'>Reset password</a>`
    )
  return true
  }
  

  @Query(()=> User, {nullable: true})
  async me(
    @Ctx() { em, req }: MyContext
  ) {
    if (!req.session.userId){
      return null
    }
    const user = await em.findOne(User, { id: req.session.userId })
    console.log('user found')
    return user
  }

  @Mutation(()=>UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    // @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput, // specifying
    @Ctx() { em, req }: MyContext
  ):Promise<UserResponse> {
    const errors = validateRegister(options)
    if(errors){
      return {errors}
    }

    const hashedPassword = await argon2.hash(options.password)
    // const user = em.create(User, { // using em
    //   username: options.username,
    //   password: hashedPassword
    // })
    let user
    try {
      const result = await (em as EntityManager) // result = [user...]
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          email: options.email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*') // return * from user
        user = result[0]
      // await em.persistAndFlush(user) // using em.create()
    } catch(err){
      // duplicate username error
      if (err.detail.includes('already exists') || err.code === '23505'){
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken'
            }
          ]
        }
      }
    }
    req.session.userId = user.id
    console.log('user created')
    return {user}
  }

  @Mutation(()=>UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail:string,
    @Arg('password') password:string,
    // @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail} 
        : {username: usernameOrEmail}
    )
    if (!user) {
      return {
        errors: [{
          field: 'usernameOrEmail',
          message: 'that username or email does not exist'
        }]
      }
    } 
    const validPassword = await argon2.verify(user.password, password)
    if (!validPassword) {
      return {
        errors: [{
          field: 'password',
          message: 'incorrect password'
        }]
      }
    }
    req.session.userId = user.id
    console.log('user logged in')
    return {user}
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() {req, res}: MyContext
  ){
    return new Promise((resolve) => 
    req.session.destroy(err => {
      if(err){
        console.log(err)
        resolve(false)
        return
      } else {
        res.clearCookie(COOKIE_NAME)
        resolve(true)
      }
    }))
  }
}