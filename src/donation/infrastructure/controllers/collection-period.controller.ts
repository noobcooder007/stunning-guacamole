import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
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
import { GetReceiptsReportByPeriodQuery } from '@/donation/application/query/get-receipts-report-by-period.query';
import { PrintSettlementLettersCommand } from '@/donation/application/command/print-settlement-letters.command';
import { PrintDeliveryLettersCommand } from '@/donation/application/command/print-delivery-letters.command';
import { PrintReceiptsReportByPeriodCommand } from '@/donation/application/command/print-receipts-report-by-period.command';
import { RegisterCollectorPaymentCommand } from '@/donation/application/command/register-collector-payment.command';
import { RegisterBulkCollectorPaymentsCommand } from '@/donation/application/command/register-bulk-collector-payments.command';
import { GetSettlementPaymentsQuery } from '@/donation/application/query/get-settlement-payments.query';
import { RegisterCollectorPaymentDto } from '@/donation/application/dto/register-collector-payment.dto';
import { RegisterBulkCollectorPaymentsDto } from '@/donation/application/dto/register-bulk-collector-payments.dto';

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
  async openPeriod(@Body() dto: OpenPeriodDto, @GetUser() user: any) {
    return await this.commandBus.execute(
      new OpenPeriodCommand(dto.month, dto.year, user.id),
    );
  }

  @Post('/close')
  @Auth(PermissionNames.EDIT_INVOICE)
  async closePeriod(@GetUser() user: any) {
    return await this.commandBus.execute(new ClosePeriodCommand(user.id));
  }

  @Get('/current')
  @Auth(PermissionNames.VIEW_INVOICE)
  async getCurrent() {
    return await this.queryBus.execute(new GetCurrentPeriodQuery());
  }

  @Get('/report')
  @Auth(PermissionNames.VIEW_INVOICE)
  async getReceiptsReport(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.queryBus.execute(
      new GetReceiptsReportByPeriodQuery(month, year),
    );
  }

  @Get('/report/export')
  @Auth(PermissionNames.VIEW_INVOICE)
  async exportReceiptsReport(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintReceiptsReportByPeriodCommand(month, year),
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
      `attachment; filename=reporte-recibos-${month}-${year}.pdf`,
    );
    result.value.pipe(res);
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

  @Post('/settlements/:settlementId/payments')
  @Auth(PermissionNames.EDIT_INVOICE)
  async registerPayment(
    @Param('settlementId', new ParseUUIDPipe()) settlementId: string,
    @Body() dto: RegisterCollectorPaymentDto,
    @GetUser() user: any,
  ) {
    return this.commandBus.execute(
      new RegisterCollectorPaymentCommand(
        settlementId,
        dto.amount,
        dto.paymentMethod,
        new Date(dto.paidAt),
        user.id,
        dto.reference,
        dto.notes,
      ),
    );
  }

  @Post('/:periodId/payments/bulk')
  @Auth(PermissionNames.EDIT_INVOICE)
  async registerBulkPayments(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Body() dto: RegisterBulkCollectorPaymentsDto,
    @GetUser() user: any,
  ) {
    return this.commandBus.execute(
      new RegisterBulkCollectorPaymentsCommand(
        periodId,
        dto.paymentMethod,
        new Date(dto.paidAt),
        user.id,
        dto.reference,
        dto.notes,
      ),
    );
  }

  @Get('/settlements/:settlementId/payments')
  @Auth(PermissionNames.VIEW_INVOICE)
  async getSettlementPayments(
    @Param('settlementId', new ParseUUIDPipe()) settlementId: string,
  ) {
    return this.queryBus.execute(new GetSettlementPaymentsQuery(settlementId));
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
