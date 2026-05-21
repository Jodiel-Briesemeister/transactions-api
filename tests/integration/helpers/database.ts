import knex, { Knex } from 'knex';
import knexConfig from '@infrastructure/database/knex';

export const createTestDb = (): Knex => knex(knexConfig);
