import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { GetSettlementPaymentsQuery } from '@/donation/application/query/get-settlement-payments.query';
import { ICollectorPaymentRepository } from '@/donation/domain/repositories/collector-payment.repository';
import { CollectorPaymentResponseDto } from '@/donation/application/dto/collector-payment.response.dto';
import { Result } from '@/shared/domain/dto/result.dto';

@QueryHandler(GetSettlementPaymentsQuery)
export class GetSettlementPaymentsHandler implements IQueryHandler<
  GetSettlementPaymentsQuery,
  Result<CollectorPaymentResponseDto[]>
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR_PAYMENT)
    private readonly paymentRepository: ICollectorPaymentRepository,
  ) {}

  async execute(
    query: GetSettlementPaymentsQuery,
  ): Promise<Result<CollectorPaymentResponseDto[]>> {
    const payments = await this.paymentRepository.findBySettlementId(
      query.settlementId,
    );
    return Result.ok(
      payments.map((p) => ({
        id: p._id.unpack(),
        settlementId: p.settlementId,
        collectorId: p.collectorId.unpack(),
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        reference: p.reference,
        notes: p.notes,
        paidAt: p.paidAt,
        registeredBy: p.registeredBy.unpack(),
        createdAt: p.createdAt,
      })),
    );
  }
}
