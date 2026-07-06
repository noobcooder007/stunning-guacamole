import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import {
  ErrorType,
  Result,
  IErrorResult,
} from '@/shared/domain/dto/result.dto';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { CreateSpecialReceiptCommand } from '@/donation/application/command/create-special-receipt.command';
import { Money, Receipt } from '@/donation/domain/aggregates/receipt.aggregate';
import { IReceiptRepository } from '@/donation/domain/repositories/receipt.repository';
import { ReceiptFolioProvider } from '@/donation/infrastructure/service/receipt-folio.provider';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import {
  Beneficient,
  BeneficientId,
} from '@/community/domain/aggregate/beneficient.aggregate';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import {
  ReceiptData,
  receiptTemplate,
} from '@/donation/application/templates/receipt.template';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { ICollectionPeriodRepository } from '@/donation/domain/repositories/collection-period.repository';

@CommandHandler(CreateSpecialReceiptCommand)
export class CreateSpecialReceiptHandler extends BaseCommandHandler<
  CreateSpecialReceiptCommand,
  Stream.Readable
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.RECEIPT)
    private readonly receiptRepository: IReceiptRepository,
    private readonly folioProvider: ReceiptFolioProvider,
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    @Inject(REPOSITORY_TOKENS.BENEFICIENT)
    private readonly beneficientRepository: IBeneficientRepository,
    @Inject(REPOSITORY_TOKENS.COLLECTION_PERIOD)
    private readonly periodRepository: ICollectionPeriodRepository,
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
    private readonly uow: UnitOfWork,
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

  private getBeneficientAddress(beneficient: Beneficient): string {
    const street = beneficient.address.street;
    const noExt = beneficient.address.numeration.noExt;
    const noInt = beneficient.address.numeration.noInt ?? '';
    const neighborhood = beneficient.address.neighborhood ?? '';
    const locality = beneficient.address.locality ?? '';
    const city = beneficient.address.city;
    const state = beneficient.address.state;
    const zipCode = beneficient.address.zipCode;
    return `${street} ${noExt} ${noInt} ${neighborhood} ${locality} ${city} ${state} ${zipCode}`;
  }

  private getBeneficientsFullname(beneficient: Beneficient): string {
    const firstname = beneficient.firstname;
    const firstLastname = beneficient.firstLastname;
    const secondLastname = beneficient.secondLastname ?? '';
    return `${firstname} ${firstLastname} ${secondLastname}`;
  }

  protected async process(
    command: CreateSpecialReceiptCommand,
  ): Promise<Result<Stream.Readable, IErrorResult>> {
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
    const openPeriod = await this.periodRepository.findOpen();
    if (!openPeriod) {
      return Result.fail({
        type: ErrorType.VALIDATION,
        message:
          'No hay un periodo abierto. Abre un periodo antes de crear un recibo especial.',
        entity: 'CollectionPeriod',
      });
    }

    const periodMonth = openPeriod.month;
    const periodYear = openPeriod.year;
    const collectionPeriodId = openPeriod._id.unpack();

    const alreadyExists = await this.receiptRepository.existsSpecial(
      command.beneficientId,
      command.collectorId,
      periodMonth,
      periodYear,
    );
    if (alreadyExists) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message:
          'A special receipt already exists for this beneficient and collector in the current period',
        entity: 'Receipt',
      });
    }

    const periodDate = new Date(periodYear, periodMonth - 1, 1);

    const { specialReceipt } = await this.uow.runInTransaction(async () => {
      const folio = await this.folioProvider.generateNext(
        command.collectorId,
        'SPECIAL',
        periodDate,
      );
      const specialReceipt = Receipt.createSpecial(
        folio,
        Money.of(command.amount, command.currency as 'MXN' | 'USD'),
        CollectorId.of(command.collectorId),
        UserId.of(command.userId),
        null,
        BeneficientId.of(command.beneficientId),
        periodMonth,
        periodYear,
        collectionPeriodId,
      );
      specialReceipt.updatePrintCount();
      await specialReceipt.generateValidationChain(this.hasher);
      await this.receiptRepository.save(specialReceipt);
      return { specialReceipt };
    });
    const [collector, beneficient] = await Promise.all([
      this.collectorRepository.findById(specialReceipt.collector.unpack()),
      specialReceipt.beneficient &&
        this.beneficientRepository.findById(
          specialReceipt.beneficient.unpack(),
        ),
    ]);
    const receiptToPrint: ReceiptData = {
      folio: specialReceipt.folio.unpack(),
      printCount: specialReceipt.printCount,
      amount: specialReceipt.amount.amount,
      currency: specialReceipt.amount.currency,
      chainValidator: specialReceipt.chainValidator,
      photoCollector: await this.getBase64FromUrl(collector.profilePath),
      collector: collector.collectorNumber,
      beneficient: beneficient ? beneficient.beneficientNumber : null,
      donorName: beneficient
        ? this.getBeneficientsFullname(beneficient)
        : 'Anónimo',
      addressDonor: beneficient
        ? this.getBeneficientAddress(beneficient)
        : 'Domicilio desconocido',
      telephoneDonor: beneficient.phoneNumber,
      recurrence: 'ESPECIAL',
      period: `${months[specialReceipt.periodMonth - 1]}${specialReceipt.periodYear}`,
      keepPrivate: beneficient.keepPrivate,
    };
    const docDefinition = receiptTemplate(Array.from([receiptToPrint]));
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
