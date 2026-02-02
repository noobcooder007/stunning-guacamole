import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { ChurchController } from '@/community/infrastructure/controllers/church.controller';
import { CollectorController } from '@/community/infrastructure/controllers/collector.controller';
import { BeneficientController } from './infrastructure/controllers/beneficient.controller';
import { ChurchSchema } from '@/community/infrastructure/persistence/typeorm/schemas/church.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { ChurchQueryService } from '@/community/infrastructure/service/church.query.service';
import { BeneficientQueryService } from '@/community/infrastructure/service/beneficient.query.service';
import { CollectorQueryService } from '@/community/infrastructure/service/collector.query.service';
import { GetChurchByIdHandler } from '@/community/application/handlers/get-church-by-id.handler';
import { GetChurchPaginatedHandler } from '@/community/application/handlers/get-church-paginated.handler';
import { GetBeneficientPaginatedHandler } from '@/community/application/handlers/get-beneficient-paginated.handler';
import { GetCollectorPaginatedHandler } from '@/community/application/handlers/get-collector-paginated.handler';
import { CreateChurchHandler } from '@/community/application/handlers/create-church.handler';
import { CreateBeneficientHandler } from '@/community/application/handlers/create-beneficient.handler';
import { CreateCollectorHandler } from '@/community/application/handlers/create-collector.handler';
import { UpdateChurchHandler } from '@/community/application/handlers/update-church.handler';
import { AssignBeneficientToCollectorHandler } from '@/community/application/handlers/assign-beneficient-to-collector.handler';
import { DesactivateAssignationEventHandler } from '@/community/application/handlers/desactivate-assignation-event.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      ChurchSchema,
      CollectorSchema,
      BeneficientSchema,
      AssignationSchema,
    ]),
    AuthModule,
  ],
  controllers: [ChurchController, CollectorController, BeneficientController],
  providers: [
    CreateBeneficientHandler,
    CreateCollectorHandler,
    CreateChurchHandler,
    GetBeneficientPaginatedHandler,
    GetCollectorPaginatedHandler,
    GetChurchPaginatedHandler,
    GetChurchByIdHandler,
    UpdateChurchHandler,
    AssignBeneficientToCollectorHandler,
    DesactivateAssignationEventHandler,
    BeneficientQueryService,
    CollectorQueryService,
    ChurchQueryService,
  ],
})
export class CommunityModule {}
