import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CreateCollectorCommand } from '../command/create-collector.command';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { UnitOfWork } from '@/database/unit-of-work';
import { Result } from '@/shared/domain/dto/result.dto';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';
import { ICollectorRepository } from '@/community/application/repositories/collector.repository';
import { ConflictException } from '@/shared/domain/exceptions/conflict-exception.exception';
import { CreateCollectorResponse } from '@/community/application/dto/create-collector.response';
import { CreateUserService } from '@/auth/infrastructure/services/create-user.service';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

@CommandHandler(CreateCollectorCommand)
export class CreateCollectorHandler extends BaseCommandHandler<
  CreateCollectorCommand,
  CreateCollectorResponse
> {
  constructor(
    private readonly uow: UnitOfWork,
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    private readonly createUserService: CreateUserService,
  ) {
    super();
  }

  protected async process(
    command: CreateCollectorCommand,
  ): Promise<Result<CreateCollectorResponse>> {
    let collectorId = null;
    await this.uow.runInTransaction(async () => {
      const resultCreateUser = await this.createUserService.execute({
        username: command.username,
        password: command.password,
        role: 'collector',
      });
      if (!resultCreateUser.isSuccess) {
        throw new DomainException(
          resultCreateUser.error.message,
          CreateCollectorHandler.name,
          resultCreateUser.error.type,
        );
      }
      const collectorToSave = CollectorMapper.commandToDomain(
        command,
        resultCreateUser.value as string,
      );
      const collectorExists =
        await this.collectorRepository.exists(collectorToSave);
      if (collectorExists) {
        throw new ConflictException(
          'Collector already exists',
          CreateCollectorHandler.name,
        );
      }
      await this.collectorRepository.save(collectorToSave);
      collectorId = collectorToSave._id.unpack();
    });
    return Result.ok({
      id: collectorId,
    });
  }
}
