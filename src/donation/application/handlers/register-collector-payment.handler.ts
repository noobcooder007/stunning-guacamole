import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { RegisterCollectorPaymentCommand } from '@/donation/application/command/register-collector-payment.command';
import { CollectorPaymentResponseDto } from '@/donation/application/dto/collector-payment.response.dto';
import { ICollectorSettlementRepository } from '@/donation/domain/repositories/collector-settlement.repository';
import { ICollectorPaymentRepository } from '@/donation/domain/repositories/collector-payment.repository';
import { CollectorPayment } from '@/donation/domain/entities/collector-payment.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { CollectorSettlementPaymentStatus } from '@/donation/domain/entities/collector-settlement.entity';

@CommandHandler(RegisterCollectorPaymentCommand)
export class RegisterCollectorPaymentHandler extends BaseCommandHandler<
  RegisterCollectorPaymentCommand,
  CollectorPaymentResponseDto
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
    command: RegisterCollectorPaymentCommand,
  ): Promise<Result<CollectorPaymentResponseDto>> {
    const settlement = await this.settlementRepository.findById(
      command.settlementId,
    );
    if (!settlement) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Settlement not found',
        entity: RegisterCollectorPaymentHandler.name,
      });
    }

    if (settlement.paymentStatus === CollectorSettlementPaymentStatus.PAID) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: 'Settlement is already fully paid',
        entity: RegisterCollectorPaymentHandler.name,
      });
    }

    if (command.amount > settlement.remainingBalance) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: `Amount ${command.amount} exceeds remaining balance ${settlement.remainingBalance}`,
        entity: RegisterCollectorPaymentHandler.name,
      });
    }

    const payment = CollectorPayment.create({
      settlementId: settlement._id.unpack(),
      collectorId: CollectorId.of(settlement.collectorId.unpack()),
      amount: command.amount,
      paymentMethod: command.paymentMethod,
      reference: command.reference ?? null,
      notes: command.notes ?? null,
      paidAt: command.paidAt,
      registeredBy: UserId.of(command.registeredBy),
      createdAt: new Date(),
    });

    settlement.registerPayment(command.amount);

    await this.uow.runInTransaction(async () => {
      await this.paymentRepository.save(payment);
      await this.settlementRepository.save(settlement);
    });

    return Result.ok<CollectorPaymentResponseDto>({
      id: payment._id.unpack(),
      settlementId: payment.settlementId,
      collectorId: payment.collectorId.unpack(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes,
      paidAt: payment.paidAt,
      registeredBy: payment.registeredBy.unpack(),
      createdAt: payment.createdAt,
    });
  }
}
