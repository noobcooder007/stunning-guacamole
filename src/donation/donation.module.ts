import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { SharedModule } from '@/shared/shared.module';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { PromiseDonationController } from '@/donation/infrastructure/controllers/promise-donation.controller';
import { ReceiptController } from '@/donation/infrastructure/controllers/receipt.controller';
import { CreatePromiseDonationHandler } from '@/donation/application/handlers/create-promise-donation.handler';
import { GetPromiseDonationByIdHandler } from '@/donation/application/handlers/get-promise-donation-by-id.handler';
import { GetPromiseDonationsPaginatedHandler } from '@/donation/application/handlers/get-promise-donation-paginated.handler';
import { GetReceiptsPaginatedHandler } from './application/handlers/get-receipts-paginated.handler';
import { DeactivatePromiseDonationHandler } from '@/donation/application/handlers/deactivate-promise-donation.handler';
import { PromiseDonationQueryService } from '@/donation/infrastructure/service/promise-donation.query.service';
import { ReceiptsQueryService } from '@/donation/infrastructure/service/receipt.query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { GenerateRecurringReceiptsHandler } from '@/donation/application/handlers/generate-recurring-receipts.handler';
import { ReceiptFolioProvider } from '@/donation/infrastructure/service/receipt-folio.provider';
import { ReceiptSequenceSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt-sequence.schema';
import { PrintReceiptsByCollectorHandler } from '@/donation/application/handlers/print-receipts-by-collector.handler';
import { CreateSpecialReceiptHandler } from '@/donation/application/handlers/create-special-receipt.handler';
import { MarkAsPaidReceiptsCommandHandler } from '@/donation/application/handlers/mark-as-paid-receipts.handler';
import { CancelReceiptCommandHandler } from '@/donation/application/handlers/cancel-receipt.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      PromiseDonationSchema,
      ReceiptSchema,
      ReceiptSequenceSchema,
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [PromiseDonationController, ReceiptController],
  providers: [
    CreatePromiseDonationHandler,
    GetPromiseDonationsPaginatedHandler,
    GetReceiptsPaginatedHandler,
    GetPromiseDonationByIdHandler,
    DeactivatePromiseDonationHandler,
    PromiseDonationQueryService,
    ReceiptsQueryService,
    GenerateRecurringReceiptsHandler,
    ReceiptFolioProvider,
    PrintReceiptsByCollectorHandler,
    CreateSpecialReceiptHandler,
    MarkAsPaidReceiptsCommandHandler,
    CancelReceiptCommandHandler,
  ],
})
export class DonationModule {}
