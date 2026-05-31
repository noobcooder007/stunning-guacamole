import { ICommand } from '@nestjs/cqrs';

export class AssignPermissionsToRoleCommand implements ICommand {
  constructor(
    readonly roleId: string,
    readonly permissionIds: string[],
  ) {}
}
