import { CommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { CreateUserService } from '@/auth/infrastructure/services/create-user.service';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Result } from '@/shared/domain/dto/result.dto';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler extends BaseCommandHandler<
  CreateUserCommand,
  string
> {
  constructor(private readonly createUserService: CreateUserService) {
    super();
  }

  protected async process(command: CreateUserCommand): Promise<Result<string>> {
    return this.createUserService.execute(command);
  }
}
