import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IAssignamentService } from '@/community/domain/services/assignament.service';
import { DeactivateAssignationsCommand } from '@/community/application/command/deactivate-assignations.command';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

@CommandHandler(DeactivateAssignationsCommand)
export class DesactivateAssignationHandler extends BaseCommandHandler<
  DeactivateAssignationsCommand,
  void
> {
  constructor(
    @Inject('IAssignamentService')
    private readonly assignationService: IAssignamentService,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(
    command: DeactivateAssignationsCommand,
  ): Promise<Result<void>> {
    await this.uow.runInTransaction(async () => {
      const result = await this.assignationService.deactivate(
        command.deactivateAssignations,
      );
      if (!result.isSuccess) {
        throw new DomainException(
          result.error.message,
          result.error.entity,
          result.error.type,
        );
      }
      this.logger.log(
        `[${this.traceId}] Assignations were deactivated with success`,
      );
    });
    return Result.ok();
  }
}
