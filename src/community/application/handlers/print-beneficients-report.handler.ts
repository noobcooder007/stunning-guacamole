import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { PrintBeneficientsReportCommand } from '@/community/application/command/print-beneficients-report.command';
import { BeneficientsReportQueryService } from '@/community/infrastructure/service/beneficients-report.query.service';
import { beneficientsReportTemplate } from '@/community/application/templates/beneficients-report.template';

@CommandHandler(PrintBeneficientsReportCommand)
export class PrintBeneficientsReportHandler extends BaseCommandHandler<
  PrintBeneficientsReportCommand,
  Stream.Readable
> {
  constructor(
    private readonly reportService: BeneficientsReportQueryService,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  protected async process(
    _command: PrintBeneficientsReportCommand,
  ): Promise<Result<Stream.Readable>> {
    const items = await this.reportService.getAll();

    const generatedAt = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const pdfStream = await this.pdfService.print(
      beneficientsReportTemplate({ items, generatedAt, total: items.length }),
    );
    return Result.ok(pdfStream);
  }
}
