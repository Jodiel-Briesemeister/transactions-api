import { IUnitOfWork } from '@domain/interfaces/IUnitOfWork';
import { Knex } from 'knex';

export class KnexUnitOfWork implements IUnitOfWork {
  constructor(private db: Knex) {}

  transaction<T>(work: (trx: unknown) => Promise<T>): Promise<T> {
    return this.db.transaction(work);
  }
}
