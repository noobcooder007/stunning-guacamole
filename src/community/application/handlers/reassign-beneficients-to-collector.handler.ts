import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { UnitOfWork } from '@/database/unit-of-work';
import {
  Result,
  IErrorResult,
  ErrorType,
} from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { IAssignamentService } from '@/community/domain/services/assignament.service';
import { ReassignBeneficientsCommand } from '@/community/application/command/reassign-beneficients.command';
import { AssignationReportResponse } from '@/community/application/dto/assignation-report.response';
import { IAssignationRepository } from '@/community/domain/repositories/assignation.repository';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';

@CommandHandler(ReassignBeneficientsCommand)
export class ReassignBeneficientsToCollectorHandler extends BaseCommandHandler<
  ReassignBeneficientsCommand,
  AssignationReportResponse
> {
  constructor(
    @Inject('IAssignamentService')
    private readonly assignationService: IAssignamentService,
    @Inject(REPOSITORY_TOKENS.ASSIGNATION)
    private readonly assignationRepository: IAssignationRepository,
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(
    command: ReassignBeneficientsCommand,
  ): Promise<Result<AssignationReportResponse, IErrorResult>> {
    let assignationReport: AssignationReportResponse;
    const isTargetActive = await this.collectorRepository.isActive(
      command.collectorId,
    );
    if (!isTargetActive) {
      throw new DomainException(
        'Collector not found or deactivated',
        Collector.name,
        ErrorType.NOT_FOUND,
      );
    }
    await this.uow.runInTransaction(async () => {
      const ids = command.assignationsIds.map((a) => a.assignationId);
      const allAssignations = await this.assignationRepository.findByIds(ids);
      if (allAssignations.length !== command.assignationsIds.length) {
        throw new DomainException(
          'Assignations not found',
          ReassignBeneficientsToCollectorHandler.name,
          ErrorType.NOT_FOUND,
        );
      }
      const beneficientsIds = allAssignations.map((a) =>
        a.beneficientId.unpack(),
      );
      const stillActiveIds = command.assignationsIds.filter((a) =>
        allAssignations.find(
          (old) => old._id.unpack() === a.assignationId && old.isActive,
        ),
      );
      if (stillActiveIds.length > 0) {
        const assignamentsDeactivated = await this.assignationService.deactivate(
          stillActiveIds,
        );
        if (!assignamentsDeactivated.isSuccess) {
          throw new DomainException(
            assignamentsDeactivated.error.message,
            assignamentsDeactivated.error.entity,
            assignamentsDeactivated.error.type,
          );
        }
      }
      const assignamentsDone = await this.assignationService.createOrReactivate(
        command.collectorId,
        beneficientsIds,
        { validateCollector: false },
      );
      if (!assignamentsDone.isSuccess) {
        throw new DomainException(
          assignamentsDone.error.message,
          assignamentsDone.error.entity,
          assignamentsDone.error.type,
        );
      }
      this.logger.log(`[${this.traceId}] Assignations saved`);
      assignationReport = assignamentsDone.value;
    });
    return Result.ok(assignationReport);
  }
}
