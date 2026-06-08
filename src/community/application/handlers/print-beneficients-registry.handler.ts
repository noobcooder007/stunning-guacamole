import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { PrintBeneficientsRegistryCommand } from '@/community/application/command/print-beneficients-registry.command';
import { BeneficientsRegistryQueryService } from '@/community/infrastructure/service/beneficients-registry.query.service';
import { beneficientsRegistryTemplate } from '@/community/application/templates/beneficients-registry.template';

@CommandHandler(PrintBeneficientsRegistryCommand)
export class PrintBeneficientsRegistryHandler extends BaseCommandHandler<
  PrintBeneficientsRegistryCommand,
  Stream.Readable
> {
  constructor(
    private readonly registryService: BeneficientsRegistryQueryService,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  protected async process(
    _command: PrintBeneficientsRegistryCommand,
  ): Promise<Result<Stream.Readable>> {
    const items = await this.registryService.getAll();

    const generatedAt = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const pdfStream = await this.pdfService.print(
      beneficientsRegistryTemplate({ items, generatedAt, total: items.length }),
    );
    return Result.ok(pdfStream);
  }
}
