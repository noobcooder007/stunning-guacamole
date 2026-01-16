// database/base.repository.ts
import { DataSource, EntityManager, EntityTarget, Repository } from 'typeorm';
import { transactionStorage } from './transactional-context';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly dataSource: DataSource,
    private readonly entity: EntityTarget<T>,
  ) {}

  protected get manager(): EntityManager {
    const store = transactionStorage.getStore();
    return store?.manager || this.dataSource.manager;
  }

  protected get repository(): Repository<T> {
    return this.manager.getRepository(this.entity);
  }

  protected get traceId(): string {
    return transactionStorage.getStore()?.traceId || 'no-trace-id';
  }
}
