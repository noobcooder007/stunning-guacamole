import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
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
import { GetReceiptsQueryDto } from '@/donation/application/dto/get-receipts-query.dto';
import { PrintReceiptsQueryDto } from '@/donation/application/dto/print-receipts-query.dto';
import { PrintCollectorLetterQueryDto } from '@/donation/application/dto/print-collector-letter-query.dto';
import { GetReceiptsQueryParams } from '@/donation/application/query/get-receipts-paginated.query';
import { GenerateRecurringReceiptsCommand } from '@/donation/application/command/generate-recurring-receipts.command';
import { PrintReceiptsByCollectorCommand } from '@/donation/application/command/print-receipts-by-collector.command';
import { PrintCollectorLetterCommand } from '@/donation/application/command/print-collector-letter.command';
import { CreateSpecialReceiptCommand } from '@/donation/application/command/create-special-receipt.command';
import { CreateSpecialReceiptDto } from '@/donation/application/dto/create-special-receipt.dto';
import { MarkAsPaidReceiptsDto } from '@/donation/application/dto/mark-as-paid-receipts.dto';
import { MarkAsPaidReceiptsCommand } from '@/donation/application/command/mark-as-paid-receipts.command';
import { CancelReceiptDto } from '@/donation/application/dto/cancel-receipt.dto';
import { CancelReceiptCommand } from '@/donation/application/command/cancel-receipt.command';
import { GetCollectorEfficiencyQuery } from '@/donation/application/query/get-collector-efficiency.query';
import { PrintCollectorEfficiencyCommand } from '@/donation/application/command/print-collector-efficiency.command';
import { ValidateReceiptQuery } from '@/donation/application/query/validate-receipt.query';

@Controller('receipts')
export class ReceiptController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {}

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

  @Get('/print')
  @Auth(PermissionNames.VIEW_INVOICE)
  async printReceipts(
    @Res() res: Response,
    @Query() query: PrintReceiptsQueryDto,
    @GetUser() user: any,
  ) {
    const response = await this.commandBus.execute(
      new PrintReceiptsByCollectorCommand(
        {
          month: query.month,
          year: query.year,
          firstname: query.firstname,
          firstLastname: query.firstLastname,
          secondLastname: query.secondLastname,
          collectorNumber: query.collectorNumber,
          type: query.type,
        },
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
    res.setHeader('Content-Disposition', 'attachment; filename=receipts.pdf');
    pdfStream.pipe(res);
  }

  @Post('/cancel')
  @Auth(PermissionNames.EDIT_INVOICE)
  async cancelReceipt(@Body() dto: CancelReceiptDto, @GetUser() user: any) {
    return this.commandBus.execute(
      new CancelReceiptCommand(dto.receiptId, dto.reason, user.id),
    );
  }

  @Post('/mark-as-paid')
  @Auth(PermissionNames.EDIT_INVOICE)
  async markAsPaid(@Body() dto: MarkAsPaidReceiptsDto) {
    return this.commandBus.execute(new MarkAsPaidReceiptsCommand(dto.receipts));
  }

  @Get('/print/collector-letter')
  @Auth(PermissionNames.VIEW_INVOICE)
  async printCollectorLetter(
    @Res() res: Response,
    @Query() query: PrintCollectorLetterQueryDto,
    @GetUser() user: any,
  ) {
    const now = new Date();
    const response = await this.commandBus.execute(
      new PrintCollectorLetterCommand(
        now.getMonth() + 1,
        now.getFullYear(),
        user.id,
        query.collectorNumber,
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
      'attachment; filename=collector-letter.pdf',
    );
    pdfStream.pipe(res);
  }

  @Get('/validate/:folio')
  async validateReceipt(@Param('folio') folio: string) {
    return this.queryBus.execute(new ValidateReceiptQuery(folio));
  }

  @Get('/collectors/:collectorId/efficiency')
  @Auth(PermissionNames.VIEW_INVOICE)
  async getCollectorEfficiency(@Param('collectorId') collectorId: string) {
    return this.queryBus.execute(new GetCollectorEfficiencyQuery(collectorId));
  }

  @Get('/collectors/:collectorId/efficiency/export')
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
