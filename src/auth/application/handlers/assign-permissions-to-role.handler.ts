import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { AssignPermissionsToRoleCommand } from '@/auth/application/commands/assign-permissions-to-role.command';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';

@CommandHandler(AssignPermissionsToRoleCommand)
export class AssignPermissionsToRoleHandler extends BaseCommandHandler<
  AssignPermissionsToRoleCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
    @Inject(REPOSITORY_TOKENS.PERMISSION)
    private readonly permissionRepository: IPermissionRepository,
  ) {
    super();
  }

  protected async process(
    command: AssignPermissionsToRoleCommand,
  ): Promise<Result<void>> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Role not found',
        entity: AssignPermissionsToRoleHandler.name,
      });
    }

    const permissions = await this.permissionRepository.findByIds(
      command.permissionIds,
    );

    if (permissions.length !== command.permissionIds.length) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'One or more permissions were not found',
        entity: AssignPermissionsToRoleHandler.name,
      });
    }

    const activePermissions = permissions.filter((p) => p.isActive);
    if (activePermissions.length !== permissions.length) {
      return Result.fail({
        type: ErrorType.VALIDATION,
        message: 'One or more permissions are inactive',
        entity: AssignPermissionsToRoleHandler.name,
      });
    }

    role.updatePermissions(activePermissions);
    await this.roleRepository.save(role);
    return Result.ok();
  }
}
