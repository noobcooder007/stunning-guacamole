import { ICommand } from '@nestjs/cqrs';

export class ChangeUserPasswordCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly newPassword: string,
  ) {}
}
