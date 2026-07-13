import { Body, Controller, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { Throttle, minutes } from '@nestjs/throttler';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { QuantityDifferenceReportDto } from '@/donation/application/dto/quantity-difference-report.dto';
import { EfficiencyReportDto } from '@/donation/application/dto/efficiency-report.dto';
import { EfficiencyConcentratedReportDto } from '@/donation/application/dto/efficiency-concentrated-report.dto';
import { PrintQuantityDifferenceReportCommand } from '@/donation/application/command/print-quantity-difference-report.command';
import { PrintEfficiencyReportCommand } from '@/donation/application/command/print-efficiency-report.command';
import { PrintEfficiencyConcentratedReportCommand } from '@/donation/application/command/print-efficiency-concentrated-report.command';

@Controller('reports/general')
export class GeneralReportController {
  constructor(private readonly commandBus: CommandBus) {}

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Post('/quantity-difference')
  @Auth(PermissionNames.VIEW_REPORT)
  async printQuantityDifference(
    @Body() dto: QuantityDifferenceReportDto,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintQuantityDifferenceReportCommand(dto.month, dto.year),
    );
    this.streamPdf(
      res,
      result,
      `diferencia-cantidades-${dto.month}-${dto.year}.pdf`,
    );
  }

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Post('/efficiency')
  @Auth(PermissionNames.VIEW_REPORT)
  async printEfficiency(
    @Body() dto: EfficiencyReportDto,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintEfficiencyReportCommand(
        dto.month,
        dto.year,
        dto.initialDonation,
        dto.finalDonation,
        dto.frequency,
        dto.collectorNum,
      ),
    );
    this.streamPdf(res, result, `eficiencia-${dto.month}-${dto.year}.pdf`);
  }

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Post('/efficiency-concentrated')
  @Auth(PermissionNames.VIEW_REPORT)
  async printEfficiencyConcentrated(
    @Body() dto: EfficiencyConcentratedReportDto,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintEfficiencyConcentratedReportCommand(
        dto.startDate,
        dto.endDate,
        dto.initialPercentage,
        dto.finalPercentage,
        dto.efficiencyType,
        dto.collectorNum,
      ),
    );
    this.streamPdf(res, result, 'eficiencia-concentrada.pdf');
  }

  private streamPdf(res: Response, result: any, filename: string): void {
    if (!result.isSuccess) {
      res.status(422).json({
        type: result.error.type,
        message: result.error.message,
      });
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    result.value.pipe(res);
  }
}
