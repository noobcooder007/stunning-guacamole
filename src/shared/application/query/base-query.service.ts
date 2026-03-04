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
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;
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
    const entityMetadata = qb.connection.getMetadata(
      qb.expressionMap.mainAlias!.target,
    );
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value === undefined || value === null || value === '') return;
      const columnMetadata = entityMetadata.columns.find(
        (col) => col.propertyName === key,
      );
      const type = columnMetadata.type;
      const isEnum = type === 'enum' || type === 'simple-enum';
      const isBoolean = type === 'boolean' || typeof value === 'boolean';
      if (isEnum) {
        qb.andWhere(`${alias}.${key}::text ILIKE :${key}`, {
          [key]: `%${value}%`,
        });
      } else if (isBoolean) {
        qb.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
      } else {
        qb.andWhere(`${alias}.${key} ILIKE :${key}`, {
          [key]: `%${value}%`,
        });
      }
    });
  }
}
