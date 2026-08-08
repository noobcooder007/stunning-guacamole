import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { PrintReceiptsByCollectorCommand } from '@/donation/application/command/print-receipts-by-collector.command';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import {
  ReceiptData,
  receiptTemplate,
} from '@/donation/application/templates/receipt.template';
import { ReceiptMapper } from '@/donation/infrastructure/persistence/mappers/receipt.mapper';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { fetchPdfCompatibleImage } from '@/shared/infrastructure/utils/fetch-pdf-image.util';

@CommandHandler(PrintReceiptsByCollectorCommand)
export class PrintReceiptsByCollectorHandler extends BaseCommandHandler<
  PrintReceiptsByCollectorCommand,
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

  private getBeneficientAddress(beneficient: BeneficientSchema): string {
    const street = beneficient.profile.street;
    const noExt = beneficient.profile.noExt;
    const noInt = beneficient.profile.noInt ?? '';
    const neighborhood = beneficient.profile.neighborhood ?? '';
    const locality = beneficient.profile.locality ?? '';
    const city = beneficient.profile.city;
    const state = beneficient.profile.state;
    const zipCode = beneficient.profile.zipCode;
    return `${street} ${noExt} ${noInt} ${neighborhood} ${locality} ${city} ${state} ${zipCode}`;
  }

  private getBeneficientsFullname(beneficient: BeneficientSchema): string {
    const firstname = beneficient.profile.firstname;
    const firstLastname = beneficient.profile.firstLastname;
    const secondLastname = beneficient.profile.secondLastname ?? '';
    return `${firstname} ${firstLastname} ${secondLastname}`;
  }

  protected async process(
    command: PrintReceiptsByCollectorCommand,
  ): Promise<Result<Stream.Readable>> {
    const recurrenceMap: Record<number, string> = {
      1: 'MENSUAL',
      2: 'BIMESTRAL',
      3: 'TRIMESTRAL',
      4: 'CUATRIMESTRAL',
      6: 'SEMESTRAL',
      12: 'ANUAL',
    };
    const months = [
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
    const receipts = await this.receiptRepository.findAllForPrint(
      command.filters,
    );
    if (!receipts.length) return Result.ok(null);
    const collectorPhotosCache: Map<string, string> = new Map();
    const receiptsToPrint: ReceiptData[] = [];
    for (const receipt of receipts) {
      if (!receipt.collector) continue;
      let photoBase64 = collectorPhotosCache.get(receipt.collectorId);
      if (!photoBase64 && receipt.collector.profilePath) {
        photoBase64 = await fetchPdfCompatibleImage(
          receipt.collector.profilePath,
        );
        collectorPhotosCache.set(receipt.collectorId, photoBase64);
      }
      const recurrence = receipt.promiseDonation
        ? (recurrenceMap[receipt.promiseDonation.recurrence] ?? '')
        : receipt.type === 'SPECIAL'
          ? 'ESPECIAL'
          : 'EN BLANCO';
      receiptsToPrint.push({
        folio: receipt.folio,
        printCount: receipt.printCount,
        recurrence,
        period: `${months[receipt.periodMonth - 1]}${receipt.periodYear}`,
        amount: receipt.amount,
        currency: receipt.currency,
        donorName: receipt.beneficient
          ? this.getBeneficientsFullname(receipt.beneficient)
          : '',
        addressDonor: receipt.beneficient
          ? this.getBeneficientAddress(receipt.beneficient)
          : '',
        telephoneDonor: receipt.beneficient?.profile.phoneNumber ?? '',
        chainValidator: receipt.chainValidator,
        photoCollector: photoBase64,
        collector: receipt.collector.collectorNumber,
        beneficient: receipt.beneficient?.beneficientNumber ?? null,
        keepPrivate: receipt.beneficient?.keepPrivate ?? false,
      });
    }
    const receiptsEntity = receipts.map((receipt) =>
      ReceiptMapper.toDomain(receipt),
    );
    receiptsEntity.forEach((receipt) => {
      receipt.updatePrintCount();
    });
    await this.receiptRepository.save(receiptsEntity);
    const docDefinition = receiptTemplate(receiptsToPrint);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
