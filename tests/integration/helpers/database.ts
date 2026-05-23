import knex from 'knex';
import type { Knex } from 'knex';
import { env } from '@shared/env';
import path from 'path';

const migrationsDir = path.resolve(__dirname, '../../../migrations');

export const createTestDb = (): Knex =>
  knex({
    client: 'pg',
    connection: {
      host: env.dbHost,
      port: env.dbPort,
      user: env.dbUser,
      password: env.dbPassword,
      database: 'mydb_test',
    },
    migrations: {
      directory: migrationsDir,
    },
    pool: { min: 1, max: 5 },
    searchPath: [env.dbSchema],
  });
