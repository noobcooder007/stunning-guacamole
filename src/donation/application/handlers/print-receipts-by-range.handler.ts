import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { PrintReceiptsByRangeCommand } from '@/donation/application/command/print-receipts-by-range.command';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import {
  ReceiptData,
  receiptTemplate,
} from '@/donation/application/templates/receipt.template';
import { ReceiptMapper } from '@/donation/infrastructure/persistence/mappers/receipt.mapper';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';

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

@CommandHandler(PrintReceiptsByRangeCommand)
export class PrintReceiptsByRangeHandler extends BaseCommandHandler<
  PrintReceiptsByRangeCommand,
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

  private async getBase64FromUrl(url: string): Promise<string | null> {
    try {
      const host = process.env.APP_URL || 'http://localhost:4321';
      const response = await fetch(`${host}/public/profile-pictures/${url}`);
      if (!response.ok) return null;
      const contentType = response.headers.get('content-type') ?? 'image/webp';
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return `data:${contentType};base64,${base64}`;
    } catch {
      return null;
    }
  }

  private getBeneficientAddress(b: BeneficientSchema): string {
    return `${b.street} ${b.noExt} ${b.noInt ?? ''} ${b.neighborhood ?? ''} ${b.locality ?? ''} ${b.city} ${b.state} ${b.zipCode}`;
  }

  private getBeneficientFullname(b: BeneficientSchema): string {
    return `${b.firstname} ${b.firstLastname} ${b.secondLastname ?? ''}`.trim();
  }

  protected async process(
    command: PrintReceiptsByRangeCommand,
  ): Promise<Result<Stream.Readable>> {
    const receipts = await this.receiptRepository.findByFolioRange(
      command.filters,
    );
    if (!receipts.length) return Result.ok(null);

    const collectorPhotosCache = new Map<string, string>();
    const receiptsToPrint: ReceiptData[] = [];

    for (const receipt of receipts) {
      if (!receipt.collector) continue;

      let photoBase64 = collectorPhotosCache.get(receipt.collectorId);
      if (!photoBase64 && receipt.collector.profilePath) {
        photoBase64 = await this.getBase64FromUrl(receipt.collector.profilePath);
        collectorPhotosCache.set(receipt.collectorId, photoBase64);
      }

      const recurrence = receipt.promiseDonation
        ? (RECURRENCE_LABELS[receipt.promiseDonation.recurrence] ?? '')
        : 'EN BLANCO';

      receiptsToPrint.push({
        folio: receipt.folio,
        printCount: receipt.printCount,
        recurrence,
        period: `${MONTH_LABELS[receipt.periodMonth - 1]}${receipt.periodYear}`,
        amount: receipt.amount,
        currency: receipt.currency,
        donorName: receipt.beneficient
          ? this.getBeneficientFullname(receipt.beneficient)
          : '',
        addressDonor: receipt.beneficient
          ? this.getBeneficientAddress(receipt.beneficient)
          : '',
        telephoneDonor: receipt.beneficient?.phoneNumber ?? '',
        chainValidator: receipt.chainValidator,
        photoCollector: photoBase64,
        collector: receipt.collector.collectorNumber,
        beneficient: receipt.beneficient?.beneficientNumber ?? null,
        keepPrivate: receipt.beneficient?.keepPrivate ?? false,
      });
    }

    const receiptEntities = receipts.map((r) => ReceiptMapper.toDomain(r));
    receiptEntities.forEach((r) => r.updatePrintCount());
    await this.receiptRepository.save(receiptEntities);

    const docDefinition = receiptTemplate(receiptsToPrint);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
