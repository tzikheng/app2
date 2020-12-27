import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
// import redis from 'redis';
import Redis from 'ioredis'
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { User } from './entities/User';
import microConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/posts';
import { UserResolver } from './resolvers/users';
import { MyContext } from './types';
// import { Post } from './entities/Post';

const main = async () => {
  const orm = await MikroORM.init(microConfig)
  // await orm.em.nativeDelete(User, {}) // delete all users
  await orm.getMigrator().up(); // runs migrations
  
  // const post = orm.em.create(Post, {title: 'My first post'})
  // await orm.em.persistAndFlush(post)
  // const posts = await orm.em.find(Post, {});
  // console.log(posts)

  const app = express();

  const RedisStore = connectRedis(session)
  const redis = new Redis() // = redis.createClient()
  app.use(
    cors({
      origin:'http://localhost:3000',
      credentials: true
    })
  )
  app.use(
    session({
      name: COOKIE_NAME,
      saveUninitialized: false,
      store: new RedisStore({ 
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000*60*60*24*365*10, // 10 years
        httpOnly: true,
        sameSite: 'lax', //csrf
        secure: __prod__ //cookie only works in http
      },
      secret: 'SECRET KEY',
      resave: false
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({req, res}): MyContext => ({ em: orm.em, req, res, redis }) 
    // context: ({req, res}) => ({ em: orm.em, req, res }) 
  })

  apolloServer.applyMiddleware({ 
    app,
    cors: false, // CORS error
  })

  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
}


main().catch(err => {
  console.log(err)
});