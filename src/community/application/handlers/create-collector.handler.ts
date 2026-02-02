import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { Result } from '@/shared/domain/dto/result.dto';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ConflictException } from '@/shared/domain/exceptions/conflict-exception.exception';
import { CreateCollectorCommand } from '@/community/application/command/create-collector.command';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { CreateCollectorResponse } from '@/community/application/dto/create-collector.response';
import { CollectorMapper } from '@/community/infrastructure/persistence/mappers/collector.mapper';
import { CreateUserService } from '@/auth/infrastructure/services/create-user.service';

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
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
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
        throw new ConflictException(
          resultCreateUser.error.message,
          resultCreateUser.error.entity,
        );
      }
      const [nssHash, addressHash, phoneNumberHash, telephoneNumberHash] =
        await Promise.all([
          this.hasher.hash(command.nss, true),
          this.hasher.hash(
            `${command.street}|${command.noExt}|${command.noInt}|${command.neighborhood}|${command.locality}|${command.city}|${command.state}|${command.zipCode}|`,
            true,
          ),
          this.hasher.hash(command.phoneNumber, true),
          this.hasher.hash(command.telephoneNumber, true),
        ]);
      command.nssHash = nssHash;
      command.addressHash = addressHash;
      command.phoneNumberHash = phoneNumberHash;
      command.telephoneNumberHash = telephoneNumberHash;
      const collectorToSave = CollectorMapper.commandToDomain(
        command,
        resultCreateUser.value as string,
      );
      const collectorExists =
        await this.collectorRepository.exists(collectorToSave);
      if (collectorExists) {
        throw new ConflictException(
          'Collector already exists',
          CollectorMapper.name,
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
