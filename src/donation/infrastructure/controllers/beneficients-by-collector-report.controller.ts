import { Controller, Get, Query, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { Throttle, minutes } from '@nestjs/throttler';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { BeneficientsByCollectorReportQueryDto } from '@/donation/application/dto/beneficients-by-collector-report-query.dto';
import { GetBeneficientsByCollectorReportQuery } from '@/donation/application/query/get-beneficients-by-collector-report.query';
import { PrintBeneficientsByCollectorReportCommand } from '@/donation/application/command/print-beneficients-by-collector-report.command';
import { pipePdfStream } from '@/shared/infrastructure/utils/pipe-pdf-stream.util';

@Controller('reports/beneficients-by-collector')
export class BeneficientsByCollectorReportController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Auth(PermissionNames.VIEW_REPORT)
  async getReport(@Query() dto: BeneficientsByCollectorReportQueryDto) {
    return this.queryBus.execute(
      new GetBeneficientsByCollectorReportQuery(
        dto.fromMonth,
        dto.fromYear,
        dto.toMonth,
        dto.toYear,
        dto.includeSpecial ?? true,
        dto.collectorNumber,
      ),
    );
  }

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Get('/pdf')
  @Auth(PermissionNames.VIEW_REPORT)
  async exportReport(
    @Query() dto: BeneficientsByCollectorReportQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintBeneficientsByCollectorReportCommand(
        dto.fromMonth,
        dto.fromYear,
        dto.toMonth,
        dto.toYear,
        dto.includeSpecial ?? true,
        dto.collectorNumber,
      ),
    );
    if (!result.isSuccess) {
      res.status(422).json({
        type: result.error.type,
        message: result.error.message,
      });
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte-bienhechores-por-colector-${dto.fromMonth}-${dto.fromYear}_${dto.toMonth}-${dto.toYear}.pdf`,
    );
    await pipePdfStream(result.value, res);
  }
}
