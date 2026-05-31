import { ICommand } from '@nestjs/cqrs';

export class CreatePermissionCommand implements ICommand {
  constructor(
    readonly name: string,
    readonly description: string,
  ) {}
}
