import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { SharedModule } from '@/shared/shared.module';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { PromiseDonationController } from '@/donation/infrastructure/controllers/promise-donation.controller';
import { ReceiptController } from '@/donation/infrastructure/controllers/receipt.controller';
import { CollectionPeriodController } from '@/donation/infrastructure/controllers/collection-period.controller';
import { CreatePromiseDonationHandler } from '@/donation/application/handlers/create-promise-donation.handler';
import { GetPromiseDonationByIdHandler } from '@/donation/application/handlers/get-promise-donation-by-id.handler';
import { GetPromiseDonationsPaginatedHandler } from '@/donation/application/handlers/get-promise-donation-paginated.handler';
import { GetPromiseDonationsWithBeneficientPaginatedHandler } from './application/handlers/get-promise-donation-with-beneficients-paginated.handler';
import { GetReceiptsPaginatedHandler } from './application/handlers/get-receipts-paginated.handler';
import { DeactivatePromiseDonationHandler } from '@/donation/application/handlers/deactivate-promise-donation.handler';
import { ReactivatePromiseDonationHandler } from '@/donation/application/handlers/reactivate-promise-donation.handler';
import {
  UpdatePromiseDonationAmountHandler,
  UpdatePromiseDonationRecurrenceHandler,
  UpdatePromiseDonationInstructionsHandler,
} from '@/donation/application/handlers/update-promise-donation.handler';
import { PromiseDonationQueryService } from '@/donation/infrastructure/service/promise-donation.query.service';
import { ReceiptsQueryService } from '@/donation/infrastructure/service/receipt.query.service';
import { ReceiptSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt.schema';
import { GenerateRecurringReceiptsHandler } from '@/donation/application/handlers/generate-recurring-receipts.handler';
import { ReceiptFolioProvider } from '@/donation/infrastructure/service/receipt-folio.provider';
import { ReceiptSequenceSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/receipt-sequence.schema';
import { PrintReceiptsByCollectorHandler } from '@/donation/application/handlers/print-receipts-by-collector.handler';
import { PrintReceiptsByRangeHandler } from '@/donation/application/handlers/print-receipts-by-range.handler';
import { CreateSpecialReceiptHandler } from '@/donation/application/handlers/create-special-receipt.handler';
import { MarkAsPaidReceiptsCommandHandler } from '@/donation/application/handlers/mark-as-paid-receipts.handler';
import { CancelReceiptCommandHandler } from '@/donation/application/handlers/cancel-receipt.handler';
import { CollectionPeriodSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collection-period.schema';
import { CollectorSettlementSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collector-settlement.schema';
import { CollectorPaymentSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/collector-payment.schema';
import { RegisterCollectorPaymentHandler } from '@/donation/application/handlers/register-collector-payment.handler';
import { RegisterBulkCollectorPaymentsHandler } from '@/donation/application/handlers/register-bulk-collector-payments.handler';
import { GetSettlementPaymentsHandler } from '@/donation/application/handlers/get-settlement-payments.handler';
import { OpenPeriodHandler } from '@/donation/application/handlers/open-period.handler';
import { ClosePeriodHandler } from '@/donation/application/handlers/close-period.handler';
import { GetCurrentPeriodHandler } from '@/donation/application/handlers/get-current-period.handler';
import { GetPeriodSettlementsHandler } from '@/donation/application/handlers/get-period-settlements.handler';
import { PrintSettlementLettersHandler } from '@/donation/application/handlers/print-settlement-letters.handler';
import { PrintDeliveryLettersHandler } from '@/donation/application/handlers/print-delivery-letters.handler';
import { GetCollectorEfficiencyHandler } from '@/donation/application/handlers/get-collector-efficiency.handler';
import { PrintCollectorEfficiencyHandler } from '@/donation/application/handlers/print-collector-efficiency.handler';
import { CollectorEfficiencyQueryService } from '@/donation/infrastructure/service/collector-efficiency.query.service';
import { ValidateReceiptHandler } from '@/donation/application/handlers/validate-receipt.handler';
import { GetReceiptByFolioHandler } from '@/donation/application/handlers/get-receipt-by-folio.handler';
import { GetReceiptsReportByPeriodHandler } from '@/donation/application/handlers/get-receipts-report-by-period.handler';
import { PrintReceiptsReportByPeriodHandler } from '@/donation/application/handlers/print-receipts-report-by-period.handler';
import { ReceiptsReportQueryService } from '@/donation/infrastructure/service/receipts-report.query.service';
import { GetDonationGrowthReportHandler } from '@/donation/application/handlers/get-donation-growth-report.handler';
import { DonationGrowthReportQueryService } from '@/donation/infrastructure/service/donation-growth-report.query.service';
import { GetConsolidatedCollectorEfficiencyHandler } from '@/donation/application/handlers/get-consolidated-collector-efficiency.handler';
import { ConsolidatedCollectorEfficiencyQueryService } from '@/donation/infrastructure/service/consolidated-collector-efficiency.query.service';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      PromiseDonationSchema,
      ReceiptSchema,
      ReceiptSequenceSchema,
      CollectionPeriodSchema,
      CollectorSettlementSchema,
      CollectorPaymentSchema,
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [
    PromiseDonationController,
    ReceiptController,
    CollectionPeriodController,
  ],
  providers: [
    CreatePromiseDonationHandler,
    GetPromiseDonationsPaginatedHandler,
    GetPromiseDonationsWithBeneficientPaginatedHandler,
    GetReceiptsPaginatedHandler,
    GetPromiseDonationByIdHandler,
    DeactivatePromiseDonationHandler,
    ReactivatePromiseDonationHandler,
    UpdatePromiseDonationAmountHandler,
    UpdatePromiseDonationRecurrenceHandler,
    UpdatePromiseDonationInstructionsHandler,
    PromiseDonationQueryService,
    ReceiptsQueryService,
    GenerateRecurringReceiptsHandler,
    ReceiptFolioProvider,
    PrintReceiptsByCollectorHandler,
    PrintReceiptsByRangeHandler,
    CreateSpecialReceiptHandler,
    MarkAsPaidReceiptsCommandHandler,
    CancelReceiptCommandHandler,
    OpenPeriodHandler,
    ClosePeriodHandler,
    GetCurrentPeriodHandler,
    GetPeriodSettlementsHandler,
    PrintSettlementLettersHandler,
    PrintDeliveryLettersHandler,
    GetCollectorEfficiencyHandler,
    CollectorEfficiencyQueryService,
    PrintCollectorEfficiencyHandler,
    ValidateReceiptHandler,
    GetReceiptByFolioHandler,
    GetReceiptsReportByPeriodHandler,
    PrintReceiptsReportByPeriodHandler,
    ReceiptsReportQueryService,
    GetDonationGrowthReportHandler,
    DonationGrowthReportQueryService,
    GetConsolidatedCollectorEfficiencyHandler,
    ConsolidatedCollectorEfficiencyQueryService,
    RegisterCollectorPaymentHandler,
    RegisterBulkCollectorPaymentsHandler,
    GetSettlementPaymentsHandler,
  ],
})
export class DonationModule {}
