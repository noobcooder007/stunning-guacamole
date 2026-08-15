import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { PrintBeneficientsByCollectorReportCommand } from '@/donation/application/command/print-beneficients-by-collector-report.command';
import { BeneficientsByCollectorReportQueryService } from '@/donation/infrastructure/service/beneficients-by-collector-report.query.service';
import { beneficientsByCollectorReportTemplate } from '@/donation/application/templates/beneficients-by-collector-report.template';

@CommandHandler(PrintBeneficientsByCollectorReportCommand)
export class PrintBeneficientsByCollectorReportHandler extends BaseCommandHandler<
  PrintBeneficientsByCollectorReportCommand,
  Stream.Readable
> {
  constructor(
    private readonly reportService: BeneficientsByCollectorReportQueryService,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  protected async process(
    command: PrintBeneficientsByCollectorReportCommand,
  ): Promise<Result<Stream.Readable>> {
    const data = await this.reportService.getReport(
      command.fromMonth,
      command.fromYear,
      command.toMonth,
      command.toYear,
      command.includeSpecial,
      command.collectorNumber,
    );

    const generatedAt = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const docDefinition = beneficientsByCollectorReportTemplate(
      data,
      generatedAt,
    );
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
