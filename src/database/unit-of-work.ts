// database/unit-of-work.ts
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { transactionStorage } from '@/database/transactional-context';

@Injectable()
export class UnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Ejecuta una función dentro de una transacción atómica.
   */
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const currentStore = transactionStorage.getStore();

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // 'run' hace que el manager esté disponible para cualquier
      // función llamada dentro del callback 'work'
      return await transactionStorage.run({ ...currentStore, manager }, () => {
        return work();
      });
    });
  }
}
