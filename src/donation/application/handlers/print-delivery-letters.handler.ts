import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PrintDeliveryLettersCommand } from '@/donation/application/command/print-delivery-letters.command';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import {
  CollectorLetterData,
  CollectorLetterReceiptRow,
  collectorLetterTemplate,
} from '@/donation/application/templates/collector-letter.template';

const RECURRENCE_LABELS: Record<number, string> = {
  1: 'MENSUAL',
  2: 'BIMESTRAL',
  3: 'TRIMESTRAL',
  4: 'CUATRIMESTRAL',
  6: 'SEMESTRAL',
  12: 'ANUAL',
};

const MONTH_LABELS = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

@CommandHandler(PrintDeliveryLettersCommand)
export class PrintDeliveryLettersHandler extends BaseCommandHandler<
  PrintDeliveryLettersCommand,
  Stream.Readable
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  private getCollectorFullname(c: CollectorSchema): string {
    return `${c.firstname} ${c.firstLastname} ${c.secondLastname ?? ''}`.trim();
  }

  private getBeneficientFullname(b: BeneficientSchema): string {
    return `${b.firstname} ${b.firstLastname} ${b.secondLastname ?? ''}`.trim();
  }

  protected async process(
    command: PrintDeliveryLettersCommand,
  ): Promise<Result<Stream.Readable>> {
    const period = await this.periodRepository.findById(command.periodId);
    if (!period) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Period not found',
        entity: PrintDeliveryLettersHandler.name,
      });
    }

    const receipts = await this.receiptRepository.findPendingByCollectionPeriodId(
      command.periodId,
    );

    if (receipts.length === 0) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'No pending receipts found for this period',
        entity: PrintDeliveryLettersHandler.name,
      });
    }

    const unprinted = receipts.filter((r) => r.printCount === 0);
    if (unprinted.length > 0) {
      const byCollector = new Map<string, number>();
      for (const r of unprinted) {
        const collector = r.collector as CollectorSchema;
        const name = collector
          ? `${collector.firstname} ${collector.firstLastname} (No. ${collector.collectorNumber})`
          : r.collectorId;
        byCollector.set(name, (byCollector.get(name) ?? 0) + 1);
      }
      const detail = Array.from(byCollector.entries())
        .map(([name, count]) => `${name}: ${count} recibo${count !== 1 ? 's' : ''} sin imprimir`)
        .join('; ');
      return Result.fail({
        type: ErrorType.VALIDATION,
        message: `Hay recibos sin imprimir: ${detail}`,
        entity: PrintDeliveryLettersHandler.name,
      });
    }

    const periodLabel = `${MONTH_LABELS[period.month - 1]}${period.year}`;

    // Group by collector
    const byCollector = new Map<string, ReceiptSchema[]>();
    for (const r of receipts) {
      if (!byCollector.has(r.collectorId)) byCollector.set(r.collectorId, []);
      byCollector.get(r.collectorId).push(r);
    }

    const letters: CollectorLetterData[] = [];

    for (const [, collectorReceipts] of byCollector) {
      const collector = collectorReceipts[0].collector as CollectorSchema;

      const rows: CollectorLetterReceiptRow[] = collectorReceipts.map((r) => {
        const beneficient = r.beneficient as BeneficientSchema;
        const promise = r.promiseDonation as PromiseDonationSchema;
        const receiptPeriodLabel = r.periodMonth && r.periodYear
          ? `${MONTH_LABELS[r.periodMonth - 1]}${r.periodYear}`
          : periodLabel;
        return {
          folio: r.folio,
          beneficientName: beneficient
            ? this.getBeneficientFullname(beneficient)
            : 'Anónimo',
          beneficientNumber: (beneficient as any)?.beneficientNumber ?? 0,
          amount: Number(r.amount),
          currency: r.currency,
          // Shows the receipt's own period so retroactive receipts are visible
          recurrence: promise
            ? (RECURRENCE_LABELS[promise.recurrence] ?? receiptPeriodLabel)
            : receiptPeriodLabel,
        };
      });

      const totalAmount = rows.reduce((sum, r) => sum + r.amount, 0);

      letters.push({
        collectorName: this.getCollectorFullname(collector),
        collectorNumber: collector.collectorNumber,
        period: periodLabel,
        receipts: rows,
        totalAmount,
        currency: 'MXN',
      });
    }

    const docDefinition = collectorLetterTemplate(letters);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
