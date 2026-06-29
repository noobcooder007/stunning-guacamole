import { ICommand } from '@nestjs/cqrs';

export class SetUserActiveStatusCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly isActive: boolean,
  ) {}
}
