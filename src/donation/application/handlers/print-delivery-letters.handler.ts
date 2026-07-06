import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PrintDeliveryLettersCommand } from '@/donation/application/command/print-delivery-letters.command';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import {
  CollectorLetterData,
  CollectorLetterOverdueRow,
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
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

@CommandHandler(PrintDeliveryLettersCommand)
export class PrintDeliveryLettersHandler extends BaseCommandHandler<
  PrintDeliveryLettersCommand,
  Stream.Readable
> {
  constructor(
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

  private toReceiptRow(
    r: ReceiptSchema,
    fallbackPeriodLabel: string,
  ): CollectorLetterReceiptRow {
    const beneficient = r.beneficient as BeneficientSchema;
    const promise = r.promiseDonation as PromiseDonationSchema;
    const receiptPeriodLabel =
      r.periodMonth && r.periodYear
        ? `${MONTH_LABELS[r.periodMonth - 1]}${r.periodYear}`
        : fallbackPeriodLabel;
    return {
      folio: r.folio,
      beneficientName: beneficient
        ? this.getBeneficientFullname(beneficient)
        : 'Anónimo',
      beneficientNumber: (beneficient as any)?.beneficientNumber ?? 0,
      amount: Number(r.amount),
      currency: r.currency,
      recurrence: promise
        ? (RECURRENCE_LABELS[promise.recurrence] ?? receiptPeriodLabel)
        : receiptPeriodLabel,
    };
  }

  private toOverdueRow(r: ReceiptSchema): CollectorLetterOverdueRow {
    const period =
      r.periodMonth && r.periodYear
        ? `${MONTH_LABELS[r.periodMonth - 1]}${r.periodYear}`
        : '—';
    const beneficient = r.beneficient as BeneficientSchema;
    const promise = r.promiseDonation as PromiseDonationSchema;
    return {
      folio: r.folio,
      beneficientName: beneficient
        ? this.getBeneficientFullname(beneficient)
        : 'Anónimo',
      beneficientNumber: (beneficient as any)?.beneficientNumber ?? 0,
      amount: Number(r.amount),
      currency: r.currency,
      recurrence: promise ? (RECURRENCE_LABELS[promise.recurrence] ?? '') : '',
      period,
    };
  }

  private groupByCollector(
    receipts: ReceiptSchema[],
  ): Map<string, ReceiptSchema[]> {
    const map = new Map<string, ReceiptSchema[]>();
    for (const r of receipts) {
      if (!r.collectorId) continue;
      if (!map.has(r.collectorId)) map.set(r.collectorId, []);
      map.get(r.collectorId).push(r);
    }
    return map;
  }

  protected async process(
    command: PrintDeliveryLettersCommand,
  ): Promise<Result<Stream.Readable>> {
    const [currentReceipts, overdueReceipts] = await Promise.all([
      this.receiptRepository.findAllForPrint({
        month: command.month,
        year: command.year,
        collectorNumber: command.collectorNumber,
      }),
      this.receiptRepository.findOverdueUnpaid(
        command.month,
        command.year,
        command.collectorNumber,
      ),
    ]);

    if (!currentReceipts.length && !overdueReceipts.length) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'No se encontraron recibos para el periodo indicado',
        entity: PrintDeliveryLettersHandler.name,
      });
    }

    const unprinted = currentReceipts.filter((r) => r.printCount === 0);
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
        .map(
          ([name, count]) =>
            `${name}: ${count} recibo${count !== 1 ? 's' : ''} sin imprimir`,
        )
        .join('; ');
      return Result.fail({
        type: ErrorType.VALIDATION,
        message: `Hay recibos sin imprimir: ${detail}`,
        entity: PrintDeliveryLettersHandler.name,
      });
    }

    const periodLabel = `${MONTH_LABELS[command.month - 1]}${command.year}`;

    const currentByCollector = this.groupByCollector(currentReceipts);
    const overdueByCollector = this.groupByCollector(overdueReceipts);

    const collectorIds = new Set([
      ...currentByCollector.keys(),
      ...overdueByCollector.keys(),
    ]);

    const letters: CollectorLetterData[] = [];

    for (const collectorId of collectorIds) {
      const current = currentByCollector.get(collectorId) ?? [];
      const overdue = overdueByCollector.get(collectorId) ?? [];

      const collector = (current[0] ?? overdue[0])
        ?.collector as CollectorSchema;
      if (!collector) continue;

      const totalAmount = current.reduce((sum, r) => sum + Number(r.amount), 0);
      const overdueTotal = overdue.reduce(
        (sum, r) => sum + Number(r.amount),
        0,
      );
      const currency = (current[0] ?? overdue[0]).currency;

      letters.push({
        collectorName: this.getCollectorFullname(collector),
        collectorNumber: collector.collectorNumber,
        period: periodLabel,
        currency,
        totalAmount,
        receipts: current.map((r) => this.toReceiptRow(r, periodLabel)),
        overdueReceipts: overdue.map((r) => this.toOverdueRow(r)),
        overdueTotal,
      });
    }

    letters.sort((a, b) => a.collectorNumber - b.collectorNumber);

    if (!letters.length) return Result.ok(null);

    const docDefinition = collectorLetterTemplate(letters);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
