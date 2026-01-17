import {
  DataSource,
  ObjectLiteral,
  SelectQueryBuilder,
  EntityTarget,
} from 'typeorm';

export abstract class BaseQueryService {
  // Lo definimos como protected para que los hijos lo usen
  constructor(protected readonly dataSource: DataSource) {}

  /**
   * Crea un QueryBuilder listo para usar
   */
  protected getQueryBuilder<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    alias: string,
  ): SelectQueryBuilder<T> {
    return this.dataSource.getRepository(entity).createQueryBuilder(alias);
  }

  /**
   * Aplica paginación estándar
   */
  protected applyPagination<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 10,
  ): SelectQueryBuilder<T> {
    const skip = (page - 1) * limit;
    return qb.skip(skip).take(limit);
  }

  /**
   * Filtros dinámicos basados en un objeto
   */
  protected applyFilters<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    filters: Record<string, any>,
  ): void {
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value === undefined || value === null || value === '') return;
      qb.andWhere(`${alias}.${key} ILIKE :${key}`, { [key]: `%${value}%` });
    });
  }
}
