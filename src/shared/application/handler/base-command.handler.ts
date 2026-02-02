import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@/shared/domain/dto/result.dto';
import { Logger } from '@nestjs/common';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { transactionStorage } from '@/database/transactional-context';

export abstract class BaseCommandHandler<
  TCommand extends ICommand = any,
  TData = any,
> implements ICommandHandler<TCommand, Result<TData>> {
  protected readonly logger = new Logger(this.constructor.name);

  protected get traceId(): string {
    return transactionStorage.getStore()?.traceId;
  }

  async execute(
    command: TCommand & { metadata?: CommandMetadata },
  ): Promise<Result<TData>> {
    return await this.process(command, command.metadata);
  }

  protected abstract process(
    command: TCommand,
    context?: CommandMetadata,
  ): Promise<Result<TData>>;
}
