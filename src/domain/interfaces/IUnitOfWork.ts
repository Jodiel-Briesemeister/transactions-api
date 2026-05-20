export interface IUnitOfWork {
  transaction<T>(work: (trx: unknown) => Promise<T>): Promise<T>;
}
