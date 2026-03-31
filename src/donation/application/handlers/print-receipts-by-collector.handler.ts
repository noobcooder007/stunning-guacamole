import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { PrintReceiptsByCollectorCommand } from '@/donation/application/command/print-receipts-by-collector.command';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import {
  ReceiptData,
  receiptTemplate,
} from '@/donation/application/templates/receipt.template';
import { ReceiptMapper } from '@/donation/infrastructure/persistence/mappers/receipt.mapper';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';

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

  async getBase64FromUrl(url: string): Promise<string> {
    const host = process.env.APP_URL || 'http://localhost:4321';
    const response = await fetch(`${host}/public/profile-pictures/${url}`);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  }

  private getBeneficientAddress(beneficient: BeneficientSchema): string {
    const street = beneficient.street;
    const noExt = beneficient.noExt;
    const noInt = beneficient.noInt ?? '';
    const neighborhood = beneficient.neighborhood ?? '';
    const locality = beneficient.locality ?? '';
    const city = beneficient.city;
    const state = beneficient.state;
    const zipCode = beneficient.zipCode;
    return `${street} ${noExt} ${noInt} ${neighborhood} ${locality} ${city} ${state} ${zipCode}`;
  }

  private getBeneficientsFullname(beneficient: BeneficientSchema): string {
    const firstname = beneficient.firstname;
    const firstLastname = beneficient.firstLastname;
    const secondLastname = beneficient.secondLastname ?? '';
    return `${firstname} ${firstLastname} ${secondLastname}`;
  }

  protected async process(
    command: PrintReceiptsByCollectorCommand,
  ): Promise<Result<Stream.Readable>> {
    const recurrenceMap = [
      'MENSUAL',
      'BIMESTRAL',
      'TRIMESTRAL',
      'CUATRIMESTRAL',
      'SEMESTRAL',
      'ANUAL',
    ];
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
    const receipts = await this.receiptRepository.findAllPendingByCollectorId(
      command.collectorId,
    );
    if (!receipts) return Result.ok(null);
    const collectorPhotosCache: Map<string, string> = new Map();
    const receiptsToPrint: ReceiptData[] = [];
    for (const receipt of receipts) {
      let photoBase64 = collectorPhotosCache.get(receipt.collectorId);
      if (!photoBase64 && receipt.collector.profilePath) {
        photoBase64 = await this.getBase64FromUrl(
          receipt.collector.profilePath,
        );
        collectorPhotosCache.set(receipt.collectorId, photoBase64);
      }
      receiptsToPrint.push({
        folio: receipt.folio,
        printCount: receipt.printCount,
        recurrence: recurrenceMap[receipt.promiseDonation.recurrence - 1],
        period: `${months[receipt.periodMonth - 1]}${receipt.periodYear}`,
        amount: receipt.amount,
        currency: receipt.currency,
        donorName: this.getBeneficientsFullname(receipt.beneficient),
        addressDonor: this.getBeneficientAddress(receipt.beneficient),
        telephoneDonor: '',
        chainValidator: receipt.chainValidator,
        photoCollector: photoBase64,
        collector: receipt.collector.collectorNumber,
        beneficient: receipt.beneficient.beneficientNumber,
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
