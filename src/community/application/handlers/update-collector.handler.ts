import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import {
  UpdateCollectorAddressCommand,
  UpdateCollectorCommand,
  UpdateCollectorContactCommand,
  UpdateCollectorPersonalCommand,
} from '@/community/application/command/update-collector.command';
import {
  UpdateProfileAddressCommand,
  UpdateProfileContactCommand,
  UpdateProfilePersonalCommand,
} from '@/community/application/command/update-profile.command';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { IProfileRepository } from '@/community/domain/repositories/profile.repository';

@CommandHandler(UpdateCollectorCommand)
export class UpdateCollectorHandler extends BaseCommandHandler<
  UpdateCollectorCommand,
  void
> {
  constructor(
    private readonly uow: UnitOfWork,
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    @Inject(REPOSITORY_TOKENS.PROFILE)
    private readonly profileRepository: IProfileRepository,
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
  ) {
    super();
  }

  protected async process(
    command: UpdateCollectorCommand,
  ): Promise<Result<void>> {
    return await this.uow.runInTransaction(async () => {
      const collector = await this.collectorRepository.findById(command.id);
      if (!collector) {
        return Result.fail({
          type: ErrorType.NOT_FOUND,
          message: 'The collector was not found',
          entity: UpdateCollectorHandler.name,
        });
      }

      if (command instanceof UpdateCollectorPersonalCommand) {
        const profileCommand = new UpdateProfilePersonalCommand(
          collector.profileId.unpack(),
          command.firstname,
          command.firstLastname,
          command.secondLastname,
        );
        collector.profile.update(profileCommand);
        await this.profileRepository.save(collector.profile);
      } else if (command instanceof UpdateCollectorAddressCommand) {
        const addr = collector.profile.address;
        const addressHash = await this.hasher.hash(
          `${command.street ?? addr.street}|${command.noExt ?? addr.numeration.noExt}|${command.noInt ?? addr.numeration.noInt}|${command.neighborhood ?? addr.neighborhood}|${command.locality ?? addr.locality}|${command.city ?? addr.city}|${command.state ?? addr.state}|${command.zipCode ?? addr.zipCode.value}|`,
          true,
        );
        const profileCommand = new UpdateProfileAddressCommand(
          collector.profileId.unpack(),
          command.street,
          command.noExt,
          command.noInt,
          command.neighborhood,
          command.locality,
          command.city,
          command.state,
          command.zipCode,
        );
        profileCommand.addressHash = addressHash;
        collector.profile.update(profileCommand);
        await this.profileRepository.save(collector.profile);
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
        if (command.phoneNumber !== undefined) {
          const profileCommand = new UpdateProfileContactCommand(
            collector.profileId.unpack(),
            command.phoneNumber,
          );
          profileCommand.phoneNumberHash = phoneNumberHash;
          collector.profile.update(profileCommand);
          await this.profileRepository.save(collector.profile);
        }
        if (command.telephoneNumber !== undefined) {
          command.telephoneNumberHash = telephoneNumberHash;
          collector.update(command);
          await this.collectorRepository.save(collector);
        }
      } else {
        collector.update(command);
        await this.collectorRepository.save(collector);
      }

      return Result.ok();
    });
  }
}
