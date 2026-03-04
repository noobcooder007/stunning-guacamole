import { QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BaseQueryHandler } from '@/shared/application/handler/base-query.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { GetPromiseDonationByIdQuery } from '@/donation/application/query/get-promise-donation-by-id.query';

@QueryHandler(GetPromiseDonationByIdQuery)
export class GetPromiseDonationByIdHandler extends BaseQueryHandler<GetPromiseDonationByIdQuery> {
  constructor(datasource: DataSource) {
    super(datasource);
  }

  protected async handle(query: GetPromiseDonationByIdQuery) {
    const promise = await this.datasource
      .getRepository(PromiseDonationSchema)
      .createQueryBuilder('promise')
      .where('promise.id = :id', { id: query.id })
      .getOne();

    if (!promise) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Promise donation not found',
        entity: 'PromiseDonation',
      });
    }

    return Result.ok(promise);
  }
}
