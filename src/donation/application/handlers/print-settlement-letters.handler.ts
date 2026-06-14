import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PrintSettlementLettersCommand } from '@/donation/application/command/print-settlement-letters.command';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { ICollectorSettlementRepository } from '@/donation/domain/repositories/collector-settlement.repository';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import {
  SettlementLetterData,
  SettlementLetterReceiptRow,
  settlementLetterTemplate,
} from '@/donation/application/templates/settlement-letter.template';

const MONTH_LABELS = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

@CommandHandler(PrintSettlementLettersCommand)
export class PrintSettlementLettersHandler extends BaseCommandHandler<
  PrintSettlementLettersCommand,
  Stream.Readable
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    @Inject(REPOSITORY_TOKENS.COLLECTOR_SETTLEMENT)
    private readonly settlementRepository: ICollectorSettlementRepository,
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  private getCollectorFullname(collector: CollectorSchema): string {
    const second = collector.secondLastname ?? '';
    return `${collector.firstname} ${collector.firstLastname} ${second}`.trim();
  }

  private getBeneficientFullname(beneficient: BeneficientSchema): string {
    const second = beneficient.secondLastname ?? '';
    return `${beneficient.firstname} ${beneficient.firstLastname} ${second}`.trim();
  }

  protected async process(
    command: PrintSettlementLettersCommand,
  ): Promise<Result<Stream.Readable>> {
    const period = await this.periodRepository.findById(command.periodId);
    if (!period) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Period not found',
        entity: PrintSettlementLettersHandler.name,
      });
    }

    const [settlements, paidReceipts] = await Promise.all([
      this.settlementRepository.findByPeriodId(command.periodId),
      this.receiptRepository.findPaidByCollectionPeriodId(command.periodId),
    ]);

    if (settlements.length === 0) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'No settlements found for this period',
        entity: PrintSettlementLettersHandler.name,
      });
    }

    const periodLabel = `${MONTH_LABELS[period.month - 1]}${period.year}`;

    // Group paid receipts by collectorId
    const receiptsByCollector = new Map<string, ReceiptSchema[]>();
    for (const receipt of paidReceipts) {
      const cid = receipt.collectorId;
      if (!receiptsByCollector.has(cid)) receiptsByCollector.set(cid, []);
      receiptsByCollector.get(cid).push(receipt);
    }

    const letters: SettlementLetterData[] = settlements.map((settlement) => {
      const collectorId = settlement.collectorId.unpack();
      const receiptsForCollector = receiptsByCollector.get(collectorId) ?? [];
      const firstReceipt = receiptsForCollector[0];
      const collector = firstReceipt?.collector as CollectorSchema;

      const receiptRows: SettlementLetterReceiptRow[] = receiptsForCollector.map(
        (r) => {
          const beneficient = r.beneficient as BeneficientSchema;
          const receiptPeriodLabel = r.periodMonth && r.periodYear
            ? `${MONTH_LABELS[r.periodMonth - 1]}${r.periodYear}`
            : '';
          return {
            folio: r.folio,
            beneficientName: beneficient
              ? this.getBeneficientFullname(beneficient)
              : 'Anónimo',
            beneficientNumber: beneficient?.beneficientNumber ?? 0,
            amount: Number(r.amount),
            currency: r.currency,
            periodLabel: receiptPeriodLabel,
          };
        },
      );

      const collectorName = collector
        ? this.getCollectorFullname(collector)
        : `Colector ${collectorId}`;

      return {
        collectorName,
        collectorNumber: collector?.collectorNumber ?? 0,
        periodLabel,
        receipts: receiptRows,
        totalCollected: settlement.totalCollected,
        commissionPercent: settlement.commissionPercent,
        commissionAmount: settlement.commissionAmount,
        nomina: settlement.nomina,
        transportAllowance: settlement.transportAllowance,
        netCommission: settlement.netCommission,
        currency: 'MXN',
      };
    });

    const docDefinition = settlementLetterTemplate(letters);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
