import knex from 'knex';
import type { Knex } from 'knex';
import { env } from '@shared/env';
import path from 'path';

const migrationsDir = path.resolve(__dirname, '../../../migrations');

/**
 * @param poolMax raise it for tests that open several transactions at once - the default of 5
 *                would make concurrent tasks queue on the pool instead of racing on the rows.
 */
export const createTestDb = (poolMax = 5): Knex =>
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
    pool: { min: 1, max: poolMax },
    searchPath: [env.dbSchema],
  });
