import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { MikroORM } from '@mikro-orm/core'
import path from 'path'

export default {
  migrations: {
    // path: process.cwd() + '/migrations', // path to folder with migration files
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex [tj] <-- type or javacript
  },
  entities: [Post, User],
  dbName: 'k',
  password:'pass',
  type: 'postgresql',
  debug: !__prod__,
  // debug: true,
} as Parameters<typeof MikroORM.init>[0]; // specift the export object type