import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { PrintQuantityDifferenceReportCommand } from '@/donation/application/command/print-quantity-difference-report.command';
import { QuantityDifferenceReportQueryService } from '@/donation/infrastructure/service/quantity-difference-report.query.service';
import { quantityDifferenceReportTemplate } from '@/donation/application/templates/quantity-difference-report.template';

@CommandHandler(PrintQuantityDifferenceReportCommand)
export class PrintQuantityDifferenceReportHandler extends BaseCommandHandler<
  PrintQuantityDifferenceReportCommand,
  Stream.Readable
> {
  constructor(
    private readonly reportService: QuantityDifferenceReportQueryService,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  protected async process(
    command: PrintQuantityDifferenceReportCommand,
  ): Promise<Result<Stream.Readable>> {
    const data = await this.reportService.getReport(
      command.month,
      command.year,
    );

    const generatedAt = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const docDefinition = quantityDifferenceReportTemplate(data, generatedAt);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
