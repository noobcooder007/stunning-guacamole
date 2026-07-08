import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { SharedModule } from '@/shared/shared.module';
import { ChurchController } from '@/community/infrastructure/controllers/church.controller';
import { CollectorController } from '@/community/infrastructure/controllers/collector.controller';
import { BeneficientController } from './infrastructure/controllers/beneficient.controller';
import { AssignmentController } from '@/community/infrastructure/controllers/assignment.controller';
import { ChurchSchema } from '@/community/infrastructure/persistence/typeorm/schemas/church.schema';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import { AssignamentService } from '@/community/domain/services/assignament.impl.service';
import { ChurchQueryService } from '@/community/infrastructure/service/church.query.service';
import { BeneficientQueryService } from '@/community/infrastructure/service/beneficient.query.service';
import { CollectorQueryService } from '@/community/infrastructure/service/collector.query.service';
import { AssignationQueryService } from '@/community/infrastructure/service/assignation.query.service';
import { GetChurchByIdHandler } from '@/community/application/handlers/get-church-by-id.handler';
import { GetChurchPaginatedHandler } from '@/community/application/handlers/get-church-paginated.handler';
import { GetBeneficientByIdHandler } from '@/community/application/handlers/get-beneficient-by-id.handler';
import { GetBeneficientPaginatedHandler } from '@/community/application/handlers/get-beneficient-paginated.handler';
import { GetBeneficientsActiveListHandler } from '@/community/application/handlers/get-beneficients-active-list.handler';
import { GetCollectorByIdHandler } from '@/community/application/handlers/get-collector-by-id.handler';
import { GetCollectorPaginatedHandler } from '@/community/application/handlers/get-collector-paginated.handler';
import { DeactivateCollectorHanlder } from '@/community/application/handlers/deactivate-collector.handler';
import { ReactivateCollectorHandler } from '@/community/application/handlers/reactivate-collector.handler';
import { CreateChurchHandler } from '@/community/application/handlers/create-church.handler';
import { CreateBeneficientHandler } from '@/community/application/handlers/create-beneficient.handler';
import { CreateCollectorHandler } from '@/community/application/handlers/create-collector.handler';
import { UpdateChurchHandler } from '@/community/application/handlers/update-church.handler';
import { UpdateBeneficientHandler } from '@/community/application/handlers/update-beneficient.handler';
import { UpdateCollectorHandler } from '@/community/application/handlers/update-collector.handler';
import { AssignBeneficientsToCollectorHandler } from '@/community/application/handlers/assign-beneficients-to-collector.handler';
import { DesactivateAssignationHandler } from '@/community/application/handlers/deactivate-assignation.handler';
import { DeactivateAssignationEventHandler } from '@/community/application/handlers/deactivate-assignation-event.handler';
import { ReassignBeneficientsToCollectorHandler } from '@/community/application/handlers/reassign-beneficients-to-collector.handler';
import { GetActivesAssignationsHandler } from '@/community/application/handlers/get-actives-assignations.handler';
import { GetAssignationsListHandler } from '@/community/application/handlers/get-assignations-list.handler';
import { GetOrphansAssignationsQueryHandler } from './application/handlers/get-orphans-assignations.handler';
import { GetUnassignedBeneficientsHandler } from './application/handlers/get-unassigned-beneficients.handler';
import { GetCollectorsActiveListHandler } from './application/handlers/get-collectors-active-list.handler';
import { DeactivateBeneficientHanlder } from './application/handlers/deactivate-beneficient.handler';
import { DeactivatePromiseDonationHandler } from '@/donation/application/handlers/deactivate-promise-donation.handler';
import { DeactivateDonationPromises } from '@/community/application/handlers/deactivate-donation-promises-event.handler';
import { AdvanceStalePromiseOnAssignationActivatedHandler } from '@/community/application/handlers/advance-stale-promise-on-assignation-activated.handler';
import { GetBeneficientsReportHandler } from './application/handlers/get-beneficients-report.handler';
import { PrintBeneficientsReportHandler } from './application/handlers/print-beneficients-report.handler';
import { BeneficientsReportQueryService } from './infrastructure/service/beneficients-report.query.service';
import { GetBeneficientsRegistryHandler } from './application/handlers/get-beneficients-registry.handler';
import { PrintBeneficientsRegistryHandler } from './application/handlers/print-beneficients-registry.handler';
import { BeneficientsRegistryQueryService } from './infrastructure/service/beneficients-registry.query.service';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      ChurchSchema,
      CollectorSchema,
      BeneficientSchema,
      AssignationSchema,
      ProfileSchema,
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [
    ChurchController,
    CollectorController,
    BeneficientController,
    AssignmentController,
  ],
  providers: [
    CreateBeneficientHandler,
    CreateCollectorHandler,
    CreateChurchHandler,
    GetBeneficientPaginatedHandler,
    GetBeneficientsActiveListHandler,
    GetBeneficientByIdHandler,
    DeactivateBeneficientHanlder,
    GetCollectorPaginatedHandler,
    GetCollectorByIdHandler,
    DeactivateCollectorHanlder,
    ReactivateCollectorHandler,
    GetChurchPaginatedHandler,
    GetChurchByIdHandler,
    UpdateChurchHandler,
    UpdateBeneficientHandler,
    UpdateCollectorHandler,
    AssignBeneficientsToCollectorHandler,
    DesactivateAssignationHandler,
    ReassignBeneficientsToCollectorHandler,
    DeactivateAssignationEventHandler,
    GetActivesAssignationsHandler,
    GetAssignationsListHandler,
    GetOrphansAssignationsQueryHandler,
    GetUnassignedBeneficientsHandler,
    GetCollectorsActiveListHandler,
    DeactivatePromiseDonationHandler,
    DeactivateDonationPromises,
    AdvanceStalePromiseOnAssignationActivatedHandler,
    GetBeneficientsReportHandler,
    PrintBeneficientsReportHandler,
    BeneficientsReportQueryService,
    GetBeneficientsRegistryHandler,
    PrintBeneficientsRegistryHandler,
    BeneficientsRegistryQueryService,
    BeneficientQueryService,
    CollectorQueryService,
    ChurchQueryService,
    AssignationQueryService,
    {
      provide: 'IAssignamentService',
      useClass: AssignamentService,
    },
  ],
})
export class CommunityModule {}
