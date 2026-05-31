import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { CreatePermissionCommand } from '@/auth/application/commands/create-permission.command';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler extends BaseCommandHandler<
  CreatePermissionCommand,
  string
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.PERMISSION)
    private readonly permissionRepository: IPermissionRepository,
  ) {
    super();
  }

  protected async process(
    command: CreatePermissionCommand,
  ): Promise<Result<string>> {
    const all = await this.permissionRepository.findAll();
    const exists = all.some((p) => p.name === command.name);
    if (exists) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: `Permission with name '${command.name}' already exists`,
        entity: CreatePermissionHandler.name,
      });
    }

    const permission = Permission.create({
      name: command.name,
      description: command.description,
    });

    await this.permissionRepository.save(permission);
    return Result.ok(permission._id.unpack());
  }
}
