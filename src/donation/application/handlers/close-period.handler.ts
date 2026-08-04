import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { ClosePeriodCommand } from '@/donation/application/command/close-period.command';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { ICollectorSettlementRepository } from '@/donation/domain/repositories/collector-settlement.repository';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import {
  CollectorSettlement,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { UnitOfWork } from '@/database/unit-of-work';
import { SettlementResponseDto } from '@/donation/application/dto/settlement.response.dto';
import { Currency } from '@/shared/domain/enums/currency.enum';
import { CurrencyConverter } from '@/shared/domain/utils/currency-converter';

export interface ClosePeriodResponse {
  periodId: string;
  month: number;
  year: number;
  closedAt: Date;
  totalCollected: number;
  totalCommissions: number;
  totalNet: number;
  exchangeRateUsdToMxn?: number;
  settlements: SettlementResponseDto[];
}

@CommandHandler(ClosePeriodCommand)
export class ClosePeriodHandler extends BaseCommandHandler<
  ClosePeriodCommand,
  ClosePeriodResponse
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    @Inject(REPOSITORY_TOKENS.COLLECTOR_SETTLEMENT)
    private readonly settlementRepository: ICollectorSettlementRepository,
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(
    command: ClosePeriodCommand,
  ): Promise<Result<ClosePeriodResponse>> {
    const period = await this.periodRepository.findOpen();
    if (!period) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'No open period found',
        entity: ClosePeriodHandler.name,
      });
    }

    const receiptsInPeriod =
      await this.receiptRepository.findByCollectionPeriodId(
        period._id.unpack(),
      );

    // La tasa se exige si hay CUALQUIER recibo en USD no cancelado (pagado o
    // pendiente), no solo los pagados: los reportes del periodo (asignado/
    // pendiente) también necesitan poder convertir a MXN, y una vez cerrado
    // el periodo no hay forma de capturar la tasa después.
    const hasUsdReceipts = receiptsInPeriod.some(
      (r) => r.status !== 'CANCELLED' && r.amount.currency === Currency.USD,
    );
    if (hasUsdReceipts && !command.exchangeRateUsdToMxn) {
      return Result.fail({
        type: ErrorType.VALIDATION,
        message:
          'Se requiere el tipo de cambio: el período tiene recibos en USD',
        entity: ClosePeriodHandler.name,
      });
    }

    // Settlement only counts receipts effectively collected (PAID)
    const paidReceipts = receiptsInPeriod.filter((r) => r.status === 'PAID');

    // Group totals by collectorId, and within each collector, by currency —
    // nunca se suman montos de distinta moneda directamente.
    const totalsMap = new Map<string, Partial<Record<Currency, number>>>();
    for (const receipt of paidReceipts) {
      const cid = receipt.collector?.unpack();
      if (!cid) continue;
      const currency = receipt.amount.currency as Currency;
      const byCurrency = totalsMap.get(cid) ?? {};
      byCurrency[currency] =
        (byCurrency[currency] ?? 0) + receipt.amount.amount;
      totalsMap.set(cid, byCurrency);
    }

    // Fetch collectors in parallel to snapshot commissionPercent
    const collectorIds = Array.from(totalsMap.keys());
    const collectors = await Promise.all(
      collectorIds.map((id) => this.collectorRepository.findById(id)),
    );

    const settlements: CollectorSettlement[] = collectors
      .filter(Boolean)
      .map((collector) => {
        const cid = collector._id.unpack();
        const collectedByCurrency = totalsMap.get(cid) ?? {};
        // commissionPercent/nomina/transportAllowance del cobrador están fijos
        // en MXN, así que la comisión siempre se calcula sobre el total ya
        // convertido a la moneda base.
        const totalCollected =
          Math.round(
            Object.entries(collectedByCurrency).reduce(
              (sum, [currency, amount]) =>
                sum +
                CurrencyConverter.toMxn(
                  amount,
                  currency as Currency,
                  command.exchangeRateUsdToMxn,
                ),
              0,
            ) * 100,
          ) / 100;
        const commissionPercent = collector.paymentData.commissionPercent;
        const commissionAmount =
          Math.round(totalCollected * commissionPercent) / 100;
        const nomina = collector.paymentData.nomina;
        const transportAllowance = collector.paymentData.transportAllowance;
        const netCommission =
          Math.round((commissionAmount - nomina + transportAllowance) * 100) /
          100;
        return CollectorSettlement.create({
          collectionPeriodId: period._id.unpack(),
          collectorId: CollectorId.of(cid),
          month: period.month,
          year: period.year,
          totalCollected,
          collectedByCurrency,
          commissionPercent,
          commissionAmount,
          nomina,
          transportAllowance,
          netCommission,
          paymentStatus: CollectorSettlementPaymentStatus.PENDING,
          totalPaid: 0,
          createdAt: new Date(),
        });
      });

    const totalCollected = settlements.reduce(
      (sum, s) => sum + s.totalCollected,
      0,
    );
    const totalCommissions = settlements.reduce(
      (sum, s) => sum + s.commissionAmount,
      0,
    );

    const closedBy = UserId.of(command.userId);
    period.close(
      closedBy,
      totalCollected,
      totalCommissions,
      command.exchangeRateUsdToMxn,
    );

    await this.uow.runInTransaction(async () => {
      await this.periodRepository.save(period);
      if (settlements.length > 0) {
        await this.settlementRepository.saveMany(settlements);
      }
    });

    const settlementDtos: SettlementResponseDto[] = settlements.map((s) => ({
      id: s._id.unpack(),
      collectionPeriodId: s.collectionPeriodId,
      collectorId: s.collectorId.unpack(),
      month: s.month,
      year: s.year,
      totalCollected: s.totalCollected,
      collectedByCurrency: s.collectedByCurrency,
      commissionPercent: s.commissionPercent,
      commissionAmount: s.commissionAmount,
      nomina: s.nomina,
      transportAllowance: s.transportAllowance,
      netCommission: s.netCommission,
      paymentStatus: s.paymentStatus,
      totalPaid: s.totalPaid,
      remainingBalance: s.remainingBalance,
      createdAt: s.createdAt,
    }));

    return Result.ok<ClosePeriodResponse>({
      periodId: period._id.unpack(),
      month: period.month,
      year: period.year,
      closedAt: period.closedAt,
      totalCollected: period.totalCollected,
      totalCommissions: period.totalCommissions,
      totalNet: period.totalNet,
      exchangeRateUsdToMxn: period.exchangeRateUsdToMxn,
      settlements: settlementDtos,
    });
  }
}
