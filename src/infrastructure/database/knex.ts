import knex, { Knex } from 'knex';
import path from 'path';
import { env } from '@shared/env';

const basePath = path.resolve(__dirname, '../../../');

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
  },
  migrations: {
    directory: path.join(basePath, 'migrations'),
  },
  pool: {
    min: 1,
    max: 5,
  },
  searchPath: [env.dbSchema],
};

export const createKnexConnection = (): Knex => {
  return knex(knexConfig);
};

export default knexConfig;
