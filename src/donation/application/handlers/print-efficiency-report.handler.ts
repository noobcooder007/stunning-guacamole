import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { PrintEfficiencyReportCommand } from '@/donation/application/command/print-efficiency-report.command';
import { EfficiencyReportQueryService } from '@/donation/infrastructure/service/efficiency-report.query.service';
import { efficiencyReportTemplate } from '@/donation/application/templates/efficiency-report.template';

@CommandHandler(PrintEfficiencyReportCommand)
export class PrintEfficiencyReportHandler extends BaseCommandHandler<
  PrintEfficiencyReportCommand,
  Stream.Readable
> {
  constructor(
    private readonly reportService: EfficiencyReportQueryService,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  protected async process(
    command: PrintEfficiencyReportCommand,
  ): Promise<Result<Stream.Readable>> {
    const data = await this.reportService.getReport({
      month: command.month,
      year: command.year,
      initialDonation: command.initialDonation,
      finalDonation: command.finalDonation,
      frequency: command.frequency,
      collectorNum: command.collectorNum,
    });

    const generatedAt = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const docDefinition = efficiencyReportTemplate(data, generatedAt);
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
