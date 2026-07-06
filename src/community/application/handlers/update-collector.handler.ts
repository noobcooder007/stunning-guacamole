import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import {
  UpdateCollectorAddressCommand,
  UpdateCollectorCommand,
  UpdateCollectorContactCommand,
} from '@/community/application/command/update-collector.command';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';

@CommandHandler(UpdateCollectorCommand)
export class UpdateCollectorHandler extends BaseCommandHandler<
  UpdateCollectorCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
  ) {
    super();
  }

  protected async process(
    command: UpdateCollectorCommand,
  ): Promise<Result<void>> {
    const collector = await this.collectorRepository.findById(command.id);
    if (!collector) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'The collector was not found',
        entity: UpdateCollectorHandler.name,
      });
    }

    if (command instanceof UpdateCollectorAddressCommand) {
      const addr = collector.address;
      command.addressHash = await this.hasher.hash(
        `${command.street ?? addr.street}|${command.noExt ?? addr.numeration.noExt}|${command.noInt ?? addr.numeration.noInt}|${command.neighborhood ?? addr.neighborhood}|${command.locality ?? addr.locality}|${command.city ?? addr.city}|${command.state ?? addr.state}|${command.zipCode ?? addr.zipCode.value}|`,
        true,
      );
    } else if (command instanceof UpdateCollectorContactCommand) {
      const [phoneNumberHash, telephoneNumberHash] = await Promise.all([
        command.phoneNumber !== undefined
          ? this.hasher.hash(command.phoneNumber, true)
          : Promise.resolve(undefined),
        command.telephoneNumber !== undefined &&
        command.telephoneNumber !== null
          ? this.hasher.hash(command.telephoneNumber, true)
          : Promise.resolve(undefined),
      ]);
      command.phoneNumberHash = phoneNumberHash;
      command.telephoneNumberHash = telephoneNumberHash;
    }

    collector.update(command);
    await this.collectorRepository.save(collector);
    return Result.ok();
  }
}
