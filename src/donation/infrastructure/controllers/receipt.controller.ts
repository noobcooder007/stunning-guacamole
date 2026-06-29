import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { Throttle, minutes } from '@nestjs/throttler';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { GetUser } from '@/auth/infrastructure/decorators/get-user.decorator';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { GetReceiptsQueryDto } from '@/donation/application/dto/get-receipts-query.dto';
import { PrintReceiptsQueryDto } from '@/donation/application/dto/print-receipts-query.dto';
import { PrintDeliveryLetterQueryDto } from '@/donation/application/dto/print-delivery-letter-query.dto';
import { GetReceiptsQueryParams } from '@/donation/application/query/get-receipts-paginated.query';
import { GenerateRecurringReceiptsCommand } from '@/donation/application/command/generate-recurring-receipts.command';
import { PrintReceiptsByCollectorCommand } from '@/donation/application/command/print-receipts-by-collector.command';
import { PrintReceiptsByRangeCommand } from '@/donation/application/command/print-receipts-by-range.command';
import { PrintDeliveryLettersCommand } from '@/donation/application/command/print-delivery-letters.command';
import { CreateSpecialReceiptCommand } from '@/donation/application/command/create-special-receipt.command';
import { CreateSpecialReceiptDto } from '@/donation/application/dto/create-special-receipt.dto';
import { MarkAsPaidReceiptsDto } from '@/donation/application/dto/mark-as-paid-receipts.dto';
import { MarkAsPaidReceiptsCommand } from '@/donation/application/command/mark-as-paid-receipts.command';
import { CancelReceiptDto } from '@/donation/application/dto/cancel-receipt.dto';
import { CancelReceiptCommand } from '@/donation/application/command/cancel-receipt.command';
import { GetCollectorEfficiencyQuery } from '@/donation/application/query/get-collector-efficiency.query';
import { PrintCollectorEfficiencyCommand } from '@/donation/application/command/print-collector-efficiency.command';
import { ValidateReceiptQuery } from '@/donation/application/query/validate-receipt.query';
import { GetReceiptByFolioQuery } from '@/donation/application/query/get-receipt-by-folio.query';

@Controller('receipts')
export class ReceiptController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {}

  @Throttle({ default: { limit: 3, ttl: minutes(1) } })
  @Post('/generate/recurring')
  @Auth(PermissionNames.ADD_INVOICE)
  generateRecurringReceipts(@GetUser() user: any) {
    return this.commandBus.execute(
      new GenerateRecurringReceiptsCommand(user.id),
    );
  }

  @Post('/generate/special')
  @Auth(PermissionNames.ADD_INVOICE)
  async generateSpecialReceipts(
    @Res() res: Response,
    @Body() dto: CreateSpecialReceiptDto,
    @GetUser() user: any,
  ) {
    const response = await this.commandBus.execute(
      new CreateSpecialReceiptCommand(
        dto.amount,
        dto.currency,
        dto.beneficientId,
        dto.collectorId,
        user.id,
      ),
    );
    if (!response.isSuccess) {
      res.status(422).json({
        type: response.error.type,
        message: response.error.message,
      });
      return;
    }
    const pdfStream = response.value;
    if (!pdfStream) {
      res.status(204).send();
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=receipts-${dto.collectorId}.pdf`,
    );
    pdfStream.pipe(res);
  }

  @Get()
  @Auth(PermissionNames.VIEW_INVOICE)
  async findAll(@Query() query: GetReceiptsQueryDto) {
    return await this.queryBus.execute(
      new GetReceiptsQueryParams(
        query.status,
        query.type,
        query.collectorId,
        query.page,
        query.limit,
        query.month,
        query.year,
        query.folio,
      ),
    );
  }

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Get('/pdf')
  @Auth(PermissionNames.VIEW_INVOICE)
  async printReceipts(
    @Res() res: Response,
    @Query() query: PrintReceiptsQueryDto,
    @GetUser() user: any,
  ) {
    const collectorFilters = {
      collectorId: query.collectorId,
      collectorNumber: query.collectorNumber,
      firstname: query.firstname,
      firstLastname: query.firstLastname,
      secondLastname: query.secondLastname,
    };

    const isRangeRequest =
      Number.isFinite(query.fromSequence) && Number.isFinite(query.toSequence);

    const command = isRangeRequest
      ? new PrintReceiptsByRangeCommand(
          {
            ...collectorFilters,
            month: query.month,
            year: query.year,
            fromSequence: query.fromSequence,
            toSequence: query.toSequence,
          },
          user.id,
        )
      : new PrintReceiptsByCollectorCommand(
          {
            ...collectorFilters,
            month: query.month,
            year: query.year,
            type: query.type,
          },
          user.id,
        );

    const response = await this.commandBus.execute(command);
    if (!response.isSuccess) {
      res.status(422).json({
        type: response.error.type,
        message: response.error.message,
      });
      return;
    }
    const pdfStream = response.value;
    if (!pdfStream) {
      res.status(204).send();
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=receipts.pdf');
    pdfStream.pipe(res);
  }

  @Put('/:folio/cancel')
  @Auth(PermissionNames.EDIT_INVOICE)
  async cancelReceipt(
    @Param('folio') folio: string,
    @Body() dto: CancelReceiptDto,
    @GetUser() user: any,
  ) {
    return this.commandBus.execute(
      new CancelReceiptCommand(folio, dto.reason, user.id),
    );
  }

  @Post('/mark-as-paid')
  @Auth(PermissionNames.EDIT_INVOICE)
  async markAsPaid(@Body() dto: MarkAsPaidReceiptsDto) {
    return this.commandBus.execute(new MarkAsPaidReceiptsCommand(dto.receipts));
  }

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Get('/delivery-letter/pdf')
  @Auth(PermissionNames.VIEW_INVOICE)
  async printDeliveryLetter(
    @Res() res: Response,
    @Query() query: PrintDeliveryLetterQueryDto,
  ) {
    const response = await this.commandBus.execute(
      new PrintDeliveryLettersCommand(
        query.month,
        query.year,
        query.collectorNumber,
      ),
    );
    if (!response.isSuccess) {
      res.status(response.error.type === 'NOT_FOUND' ? 404 : 422).json({
        type: response.error.type,
        message: response.error.message,
      });
      return;
    }
    const pdfStream = response.value;
    if (!pdfStream) {
      res.status(204).send();
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=delivery-letter.pdf',
    );
    pdfStream.pipe(res);
  }

  @Throttle({ default: { limit: 30, ttl: minutes(1) } })
  @Get('/validate/:folio')
  async validateReceipt(@Param('folio') folio: string) {
    return this.queryBus.execute(new ValidateReceiptQuery(folio));
  }

  @Get('/:folio')
  @Auth(PermissionNames.VIEW_INVOICE)
  async findByFolio(@Param('folio') folio: string) {
    return this.queryBus.execute(new GetReceiptByFolioQuery(folio));
  }

  @Get('/collectors/:collectorId/efficiency')
  @Auth(PermissionNames.VIEW_INVOICE)
  async getCollectorEfficiency(@Param('collectorId') collectorId: string) {
    return this.queryBus.execute(new GetCollectorEfficiencyQuery(collectorId));
  }

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Get('/collectors/:collectorId/efficiency/pdf')
  @Auth(PermissionNames.VIEW_INVOICE)
  async exportCollectorEfficiency(
    @Param('collectorId') collectorId: string,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintCollectorEfficiencyCommand(collectorId),
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
      `attachment; filename=eficiencia-${collectorId}.pdf`,
    );
    result.value.pipe(res);
  }
}
