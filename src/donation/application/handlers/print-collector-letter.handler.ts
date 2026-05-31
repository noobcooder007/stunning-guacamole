import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { PrintCollectorLetterCommand } from '@/donation/application/command/print-collector-letter.command';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import {
  CollectorLetterData,
  collectorLetterTemplate,
} from '@/donation/application/templates/collector-letter.template';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';

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

@CommandHandler(PrintCollectorLetterCommand)
export class PrintCollectorLetterHandler extends BaseCommandHandler<
  PrintCollectorLetterCommand,
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

  private getCollectorFullname(collector: CollectorSchema): string {
    const second = collector.secondLastname ?? '';
    return `${collector.firstname} ${collector.firstLastname} ${second}`.trim();
  }

  private groupByCollector(
    receipts: ReceiptSchema[],
  ): Map<string, ReceiptSchema[]> {
    const map = new Map<string, ReceiptSchema[]>();
    for (const receipt of receipts) {
      const id = receipt.collectorId;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(receipt);
    }
    return map;
  }

  protected async process(
    command: PrintCollectorLetterCommand,
  ): Promise<Result<Stream.Readable>> {
    const receipts = await this.receiptRepository.findPrintedOnceByPeriod(
      command.month,
      command.year,
      command.collectorNumber,
    );

    if (!receipts.length) return Result.ok(null);

    const period = `${MONTH_LABELS[command.month - 1]}${command.year}`;
    const grouped = this.groupByCollector(receipts);
    const letters: CollectorLetterData[] = [];

    for (const [, collectorReceipts] of grouped) {
      const collector = collectorReceipts[0].collector;
      if (!collector) continue;
      const totalAmount = collectorReceipts.reduce(
        (sum, r) => sum + Number(r.amount),
        0,
      );
      const currency = collectorReceipts[0].currency;

      letters.push({
        collectorName: this.getCollectorFullname(collector),
        collectorNumber: collector.collectorNumber,
        period,
        currency,
        totalAmount,
        receipts: collectorReceipts.map((r) => ({
          folio: r.folio,
          beneficientName: r.beneficient
            ? `${r.beneficient.firstname} ${r.beneficient.firstLastname} ${r.beneficient.secondLastname ?? ''}`.trim()
            : '—',
          beneficientNumber: r.beneficient?.beneficientNumber ?? 0,
          amount: Number(r.amount),
          currency: r.currency,
          recurrence: r.promiseDonation
            ? (RECURRENCE_LABELS[r.promiseDonation.recurrence] ?? '')
            : '',
        })),
      });
    }

    const docDefinition = collectorLetterTemplate(letters);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
