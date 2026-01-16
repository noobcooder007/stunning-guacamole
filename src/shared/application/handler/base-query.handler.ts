import { Logger } from '@nestjs/common';
import { IQuery, IQueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { Result } from '../../domain/dto/result.dto';

export abstract class BaseQueryHandler<
  TQuery extends IQuery = any,
  TData = any,
> implements IQueryHandler<TQuery, Result<TData>> {
  protected readonly logger = new Logger(this.constructor.name);
  constructor(protected readonly datasource: DataSource) {}

  async execute(query: TQuery): Promise<Result<TData>> {
    return await this.handle(query);
  }

  protected abstract handle(query: TQuery): Promise<Result<TData>>;
}
