import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { RegisterBulkCollectorPaymentsCommand } from '@/donation/application/command/register-bulk-collector-payments.command';
import { ICollectorSettlementRepository } from '@/donation/domain/repositories/collector-settlement.repository';
import { ICollectorPaymentRepository } from '@/donation/domain/repositories/collector-payment.repository';
import { CollectorPayment } from '@/donation/domain/entities/collector-payment.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

export interface BulkPaymentResult {
  paid: number;
  skipped: number;
}

@CommandHandler(RegisterBulkCollectorPaymentsCommand)
export class RegisterBulkCollectorPaymentsHandler extends BaseCommandHandler<
  RegisterBulkCollectorPaymentsCommand,
  BulkPaymentResult
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR_SETTLEMENT)
    private readonly settlementRepository: ICollectorSettlementRepository,
    @Inject(REPOSITORY_TOKENS.COLLECTOR_PAYMENT)
    private readonly paymentRepository: ICollectorPaymentRepository,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(
    command: RegisterBulkCollectorPaymentsCommand,
  ): Promise<Result<BulkPaymentResult>> {
    const pendingSettlements =
      await this.settlementRepository.findPendingByPeriodId(command.periodId);

    if (pendingSettlements.length === 0) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'No pending settlements found for this period',
        entity: RegisterBulkCollectorPaymentsHandler.name,
      });
    }

    const payments: CollectorPayment[] = [];
    for (const settlement of pendingSettlements) {
      const amount = settlement.remainingBalance;
      if (amount <= 0) continue;

      const payment = CollectorPayment.create({
        settlementId: settlement._id.unpack(),
        collectorId: CollectorId.of(settlement.collectorId.unpack()),
        amount,
        paymentMethod: command.paymentMethod,
        reference: command.reference ?? null,
        notes: command.notes ?? null,
        paidAt: command.paidAt,
        registeredBy: UserId.of(command.registeredBy),
        createdAt: new Date(),
      });

      settlement.registerPayment(amount);
      payments.push(payment);
    }

    await this.uow.runInTransaction(async () => {
      await this.paymentRepository.saveMany(payments);
      for (const settlement of pendingSettlements) {
        await this.settlementRepository.save(settlement);
      }
    });

    return Result.ok<BulkPaymentResult>({
      paid: payments.length,
      skipped: pendingSettlements.length - payments.length,
    });
  }
}
