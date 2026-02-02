import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';
import { IAssignamentService } from '@/community/domain/services/assignament.service';
import { DesactivateAssignationsCommand } from '@/community/application/command/desactivate-assignations.command';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

@CommandHandler(DesactivateAssignationsCommand)
export class DesactivateAssignationHandler extends BaseCommandHandler<
  DesactivateAssignationsCommand,
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
    command: DesactivateAssignationsCommand,
  ): Promise<Result<void>> {
    await this.uow.runInTransaction(async () => {
      const result = await this.assignationService.desactivateAssignations(
        command.desactivateAssignations,
      );
      if (!result.isSuccess) {
        throw new DomainException(
          result.error.message,
          result.error.entity,
          result.error.type,
        );
      }
      this.logger.log(
        `[${this.traceId}] Assignations were desactivated with success`,
      );
    });
    return Result.ok();
  }
}
