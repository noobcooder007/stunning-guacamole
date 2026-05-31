import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { GetUser } from '@/auth/infrastructure/decorators/get-user.decorator';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { OpenPeriodDto } from '@/donation/application/dto/open-period.dto';
import { OpenPeriodCommand } from '@/donation/application/command/open-period.command';
import { ClosePeriodCommand } from '@/donation/application/command/close-period.command';
import { GetCurrentPeriodQuery } from '@/donation/application/query/get-current-period.query';
import { GetPeriodSettlementsQuery } from '@/donation/application/query/get-period-settlements.query';
import { PrintSettlementLettersCommand } from '@/donation/application/command/print-settlement-letters.command';
import { PrintDeliveryLettersCommand } from '@/donation/application/command/print-delivery-letters.command';

@Controller('periods')
export class CollectionPeriodController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {}

  @Post('/open')
  @Auth(PermissionNames.EDIT_INVOICE)
  async openPeriod(
    @Body() dto: OpenPeriodDto,
    @GetUser() user: any,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new OpenPeriodCommand(dto.month, dto.year, user.id),
    );
    if (!result.isSuccess) {
      res.status(result.error.type === 'CONFLICT' ? 409 : 422).json({
        type: result.error.type,
        message: result.error.message,
      });
      return;
    }
    res.status(201).json(result.value);
  }

  @Post('/close')
  @Auth(PermissionNames.EDIT_INVOICE)
  async closePeriod(@GetUser() user: any, @Res() res: Response) {
    const result = await this.commandBus.execute(
      new ClosePeriodCommand(user.id),
    );
    if (!result.isSuccess) {
      res.status(result.error.type === 'NOT_FOUND' ? 404 : 422).json({
        type: result.error.type,
        message: result.error.message,
      });
      return;
    }
    res.status(200).json(result.value);
  }

  @Get('/current')
  @Auth(PermissionNames.VIEW_INVOICE)
  async getCurrent(@Res() res: Response) {
    const period = await this.queryBus.execute(new GetCurrentPeriodQuery());
    if (!period) {
      res.status(404).json({ message: 'No open period' });
      return;
    }
    res.status(200).json(period);
  }

  @Get('/:periodId/settlements')
  @Auth(PermissionNames.VIEW_INVOICE)
  async getSettlements(@Param('periodId') periodId: string) {
    return this.queryBus.execute(new GetPeriodSettlementsQuery(periodId));
  }

  @Get('/:periodId/settlement-letters')
  @Auth(PermissionNames.VIEW_INVOICE)
  async printSettlementLetters(
    @Param('periodId') periodId: string,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintSettlementLettersCommand(periodId),
    );
    if (!result.isSuccess) {
      res.status(result.error.type === 'NOT_FOUND' ? 404 : 422).json({
        type: result.error.type,
        message: result.error.message,
      });
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=liquidacion-${periodId}.pdf`,
    );
    result.value.pipe(res);
  }

  @Get('/:periodId/delivery-letters')
  @Auth(PermissionNames.VIEW_INVOICE)
  async printDeliveryLetters(
    @Param('periodId') periodId: string,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintDeliveryLettersCommand(periodId),
    );
    if (!result.isSuccess) {
      res.status(result.error.type === 'NOT_FOUND' ? 404 : 422).json({
        type: result.error.type,
        message: result.error.message,
      });
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=entrega-recibos-${periodId}.pdf`,
    );
    result.value.pipe(res);
  }
}
