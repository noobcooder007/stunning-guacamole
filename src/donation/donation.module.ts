import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { SharedModule } from '@/shared/shared.module';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import { PromiseDonationController } from '@/donation/infrastructure/controllers/promise-donation.controller';
import { CreatePromiseDonationHandler } from '@/donation/application/handlers/create-promise-donation.handler';
import { GetPromiseDonationByIdHandler } from '@/donation/application/handlers/get-promise-donation-by-id.handler';
import { GetPromiseDonationsPaginatedHandler } from '@/donation/application/handlers/get-promise-donation-paginated.handler';
import { DeactivatePromiseDonationHandler } from '@/donation/application/handlers/deactivate-promise-donation.handler';
import { PromiseDonationQueryService } from '@/donation/infrastructure/service/promise-donation.query.service';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([PromiseDonationSchema]),
    AuthModule,
    SharedModule,
  ],
  controllers: [PromiseDonationController],
  providers: [
    CreatePromiseDonationHandler,
    GetPromiseDonationsPaginatedHandler,
    GetPromiseDonationByIdHandler,
    DeactivatePromiseDonationHandler,
    PromiseDonationQueryService,
  ],
})
export class DonationModule {}
