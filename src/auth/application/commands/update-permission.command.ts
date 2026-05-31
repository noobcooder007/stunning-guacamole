import { ICommand } from '@nestjs/cqrs';

export class UpdatePermissionCommand implements ICommand {
  constructor(
    readonly id: string,
    readonly description: string,
  ) {}
}
