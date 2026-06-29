import { ICommand } from '@nestjs/cqrs';

export class ChangeUsernameCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly newUsername: string,
  ) {}
}
