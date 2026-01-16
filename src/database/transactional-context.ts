// En el archivo donde tienes el storage
import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

export interface TransactionContext {
  manager?: EntityManager;
  traceId: string;
}

export const transactionStorage = new AsyncLocalStorage<TransactionContext>();
