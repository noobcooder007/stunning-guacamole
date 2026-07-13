import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { PrintEfficiencyConcentratedReportCommand } from '@/donation/application/command/print-efficiency-concentrated-report.command';
import { EfficiencyConcentratedReportQueryService } from '@/donation/infrastructure/service/efficiency-concentrated-report.query.service';
import { efficiencyConcentratedReportTemplate } from '@/donation/application/templates/efficiency-concentrated-report.template';

@CommandHandler(PrintEfficiencyConcentratedReportCommand)
export class PrintEfficiencyConcentratedReportHandler extends BaseCommandHandler<
  PrintEfficiencyConcentratedReportCommand,
  Stream.Readable
> {
  constructor(
    private readonly reportService: EfficiencyConcentratedReportQueryService,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  protected async process(
    command: PrintEfficiencyConcentratedReportCommand,
  ): Promise<Result<Stream.Readable>> {
    const data = await this.reportService.getReport({
      startDate: command.startDate,
      endDate: command.endDate,
      initialPercentage: command.initialPercentage,
      finalPercentage: command.finalPercentage,
      efficiencyType: command.efficiencyType,
      collectorNum: command.collectorNum,
    });

    const generatedAt = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const docDefinition = efficiencyConcentratedReportTemplate(
      data,
      generatedAt,
    );
    const pdfStream = await this.pdfService.print(docDefinition);
    return Result.ok(pdfStream);
  }
}
