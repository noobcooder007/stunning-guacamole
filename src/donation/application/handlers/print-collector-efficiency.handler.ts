import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import Stream from 'stream';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { PrintCollectorEfficiencyCommand } from '@/donation/application/command/print-collector-efficiency.command';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { CollectorEfficiencyQueryService } from '@/donation/infrastructure/service/collector-efficiency.query.service';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import {
  CollectorEfficiencyPdfData,
  collectorEfficiencyTemplate,
} from '@/donation/application/templates/collector-efficiency.template';

@CommandHandler(PrintCollectorEfficiencyCommand)
export class PrintCollectorEfficiencyHandler extends BaseCommandHandler<
  PrintCollectorEfficiencyCommand,
  Stream.Readable
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    private readonly efficiencyService: CollectorEfficiencyQueryService,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {
    super();
  }

  protected async process(
    command: PrintCollectorEfficiencyCommand,
  ): Promise<Result<Stream.Readable>> {
    const [collector, efficiency] = await Promise.all([
      this.collectorRepository.findById(command.collectorId),
      this.efficiencyService.getEfficiency(command.collectorId),
    ]);

    if (!collector) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Collector not found',
        entity: PrintCollectorEfficiencyHandler.name,
      });
    }

    const second = collector.secondLastname ?? '';
    const collectorName =
      `${collector.firstname} ${collector.firstLastname} ${second}`.trim();

    const now = new Date();
    const generatedAt = now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const data: CollectorEfficiencyPdfData = {
      collectorName,
      collectorNumber: collector.collectorNumber,
      generatedAt,
      efficiency,
    };

    const pdfStream = await this.pdfService.print(
      collectorEfficiencyTemplate(data),
    );
    return Result.ok(pdfStream);
  }
}
