import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { PrintReceiptsReportByPeriodCommand } from '@/donation/application/command/print-receipts-report-by-period.command';
import { ReceiptsReportQueryService } from '@/donation/infrastructure/service/receipts-report.query.service';
import { receiptsReportByPeriodTemplate } from '@/donation/application/templates/receipts-report-by-period.template';

@CommandHandler(PrintReceiptsReportByPeriodCommand)
export class PrintReceiptsReportByPeriodHandler extends BaseCommandHandler<
  PrintReceiptsReportByPeriodCommand,
  Stream.Readable
> {
  constructor(
    private readonly reportService: ReceiptsReportQueryService,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  protected async process(
    command: PrintReceiptsReportByPeriodCommand,
  ): Promise<Result<Stream.Readable>> {
    const data = await this.reportService.getReportByPeriod(
      command.month,
      command.year,
    );

    const generatedAt = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const docDefinition = receiptsReportByPeriodTemplate(data, generatedAt);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
