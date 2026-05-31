import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { UpdatePermissionCommand } from '@/auth/application/commands/update-permission.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler extends BaseCommandHandler<
  UpdatePermissionCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.PERMISSION)
    private readonly permissionRepository: IPermissionRepository,
  ) {
    super();
  }

  protected async process(
    command: UpdatePermissionCommand,
  ): Promise<Result<void>> {
    const permission = await this.permissionRepository.findById(command.id);
    if (!permission) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Permission not found',
        entity: UpdatePermissionHandler.name,
      });
    }

    permission.update(command.description);
    await this.permissionRepository.save(permission);
    return Result.ok();
  }
}
