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

export interface ClosePeriodResponse {
  periodId: string;
  month: number;
  year: number;
  closedAt: Date;
  totalCollected: number;
  totalCommissions: number;
  totalNet: number;
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

    const receiptsInPeriod = await this.receiptRepository.findByCollectionPeriodId(
      period._id.unpack(),
    );
    // Settlement only counts receipts effectively collected (PAID)
    const paidReceipts = receiptsInPeriod.filter((r) => r.status === 'PAID');

    // Group totals by collectorId
    const totalsMap = new Map<string, number>();
    for (const receipt of paidReceipts) {
      const cid = receipt.collector?.unpack();
      if (!cid) continue;
      totalsMap.set(cid, (totalsMap.get(cid) ?? 0) + receipt.amount.amount);
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
        const totalCollected = totalsMap.get(cid) ?? 0;
        const commissionPercent = collector.paymentData.commissionPercent;
        const commissionAmount =
          Math.round(totalCollected * commissionPercent) / 100;
        const nomina = collector.paymentData.nomina;
        const transportAllowance = collector.paymentData.transportAllowance;
        const netCommission =
          Math.round((commissionAmount - nomina + transportAllowance) * 100) / 100;
        return CollectorSettlement.create({
          collectionPeriodId: period._id.unpack(),
          collectorId: CollectorId.of(cid),
          month: period.month,
          year: period.year,
          totalCollected,
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

    const totalCollected = settlements.reduce((sum, s) => sum + s.totalCollected, 0);
    const totalCommissions = settlements.reduce((sum, s) => sum + s.commissionAmount, 0);

    const closedBy = UserId.of(command.userId);
    period.close(closedBy, totalCollected, totalCommissions);

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
      settlements: settlementDtos,
    });
  }
}
