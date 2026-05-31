import { ICommand } from '@nestjs/cqrs';

export class DeactivatePermissionCommand implements ICommand {
  constructor(readonly id: string) {}
}
