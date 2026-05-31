import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { DeactivatePermissionCommand } from '@/auth/application/commands/deactivate-permission.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@CommandHandler(DeactivatePermissionCommand)
export class DeactivatePermissionHandler extends BaseCommandHandler<
  DeactivatePermissionCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.PERMISSION)
    private readonly permissionRepository: IPermissionRepository,
  ) {
    super();
  }

  protected async process(
    command: DeactivatePermissionCommand,
  ): Promise<Result<void>> {
    const permission = await this.permissionRepository.findById(command.id);
    if (!permission) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Permission not found',
        entity: DeactivatePermissionHandler.name,
      });
    }

    permission.deactivate();
    await this.permissionRepository.save(permission);
    return Result.ok();
  }
}
