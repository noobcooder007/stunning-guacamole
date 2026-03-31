import {
  Body,
  Controller,
  Get,
  Inject,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { Result } from '@/shared/domain/dto/result.dto';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { GetUser } from '@/auth/infrastructure/decorators/get-user.decorator';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';
import { GetReceiptsQueryDto } from '@/donation/application/dto/get-receipts-query.dto';
import { GetReceiptsQueryParams } from '@/donation/application/query/get-receipts-paginated.query';
import { GenerateRecurringReceiptsCommand } from '@/donation/application/command/generate-recurring-receipts.command';
import { PrintReceiptsByCollectorCommand } from '@/donation/application/command/print-receipts-by-collector.command';
import { CreateSpecialReceiptCommand } from '@/donation/application/command/create-special-receipt.command';
import { CreateSpecialReceiptDto } from '@/donation/application/dto/create-special-receipt.dto';
import { MarkAsPaidReceiptsDto } from '@/donation/application/dto/mark-as-paid-receipts.dto';
import { MarkAsPaidReceiptsCommand } from '@/donation/application/command/mark-as-paid-receipts.command';
import { CancelReceiptDto } from '@/donation/application/dto/cancel-receipt.dto';
import { CancelReceiptCommand } from '@/donation/application/command/cancel-receipt.command';

@Controller('receipts')
export class ReceiptController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('IPrinterService')
    private readonly pdfService: IPrinterService,
  ) {}

  @Post('generate/recurring')
  @Auth()
  generateRecurringReceipts(@GetUser() user: any) {
    return this.commandBus.execute(
      new GenerateRecurringReceiptsCommand(user.id),
    );
  }

  @Post('generate/special')
  @Auth()
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
      return Result.fail({
        type: response.error.type,
        message: response.error.message,
        entity: ReceiptController.name,
      });
    }
    const pdfStream = response.value;
    if (pdfStream) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=receipts-${dto.collectorId}.pdf`,
      );
      pdfStream.pipe(res);
    }
  }

  //   @Get(':id/pdf')
  //   @Auth()
  //   async generatePdf(
  //     @Param('id', new ParseUUIDPipe()) id: string,
  //     @Res() res: Response,
  //   ) {
  //     const receipt = await this.queryBus.execute(new GetReceiptByIdQuery(id));

  //     if (!receipt) {
  //       return res.status(404).json({ message: 'Receipt not found' });
  //     }

  //     // Update print count for watermark logic
  //     await this.commandBus.execute(new UpdateReceiptPrintCountCommand(id));

  //     const docDefinition = receiptTemplate(receipt);
  //     const pdfStream = await this.pdfService.generateStream(docDefinition);

  //     res.setHeader('Content-Type', 'application/pdf');
  //     res.setHeader(
  //       'Content-Disposition',
  //       `attachment; filename=receipt-${receipt.folio.unpack()}.pdf`,
  //     );

  //     pdfStream.pipe(res);
  //   }

  @Get()
  @Auth()
  async findAll(@Query() query: GetReceiptsQueryDto) {
    return await this.queryBus.execute(
      new GetReceiptsQueryParams(
        query.status,
        query.type,
        query.collectorId,
        query.page,
        query.limit,
      ),
    );
  }

  @Get('/print/pending')
  @Auth()
  async printPendingReceipts(
    @Res() res: Response,
    @Query('collectorId', new ParseUUIDPipe()) collectorId: string,
    @GetUser() user: any,
  ) {
    const now = new Date();
    const response = await this.commandBus.execute(
      new PrintReceiptsByCollectorCommand(
        collectorId,
        user.id,
        now.getMonth() + 1,
        now.getFullYear(),
      ),
    );
    if (!response.isSuccess) {
      return Result.fail({
        type: response.error.type,
        message: response.error.message,
        entity: ReceiptController.name,
      });
    }
    const pdfStream = response.value;
    if (pdfStream) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=receipts-${collectorId}.pdf`,
      );
      pdfStream.pipe(res);
    }
  }

  @Post('/cancel')
  @Auth()
  async cancelReceipt(@Body() dto: CancelReceiptDto, @GetUser() user: any) {
    return this.commandBus.execute(
      new CancelReceiptCommand(dto.receiptId, dto.reason, user.id),
    );
  }

  @Post('/mark-as-paid')
  @Auth()
  async markAsPaid(@Body() dto: MarkAsPaidReceiptsDto) {
    return this.commandBus.execute(new MarkAsPaidReceiptsCommand(dto.receipts));
  }
}
