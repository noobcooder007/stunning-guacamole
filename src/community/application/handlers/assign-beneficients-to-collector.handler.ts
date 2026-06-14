import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result, IErrorResult } from '@/shared/domain/dto/result.dto';
import { AssignBeneficientsCommand } from '@/community/application/command/assign-beneficients.command';
import { AssignationReportResponse } from '@/community/application/dto/assignation-report.response';
import { IAssignamentService } from '@/community/domain/services/assignament.service';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { AssignationActivatedEvent } from '@/community/application/events/assignation-activated.event';

@CommandHandler(AssignBeneficientsCommand)
export class AssignBeneficientsToCollectorHandler extends BaseCommandHandler<
  AssignBeneficientsCommand,
  AssignationReportResponse
> {
  constructor(
    @Inject('IAssignamentService')
    private readonly assignationService: IAssignamentService,
    private readonly uow: UnitOfWork,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  protected async process(
    command: AssignBeneficientsCommand,
  ): Promise<Result<AssignationReportResponse, IErrorResult>> {
    let assignationReport: AssignationReportResponse;
    let activatedBeneficientIds: string[] = [];

    await this.uow.runInTransaction(async () => {
      const result = await this.assignationService.createOrReactivate(
        command.collectorId,
        command.beneficientsIds,
      );
      if (!result.isSuccess) {
        throw new DomainException(
          result.error.message,
          result.error.entity,
          result.error.type,
        );
      }
      this.logger.log(`[${this.traceId}] Assignations saved`);
      assignationReport = result.value.report;
      activatedBeneficientIds = result.value.activatedBeneficientIds;
    });

    for (const beneficientId of activatedBeneficientIds) {
      this.eventBus.publish(new AssignationActivatedEvent(beneficientId));
    }

    return Result.ok(assignationReport);
  }
}
