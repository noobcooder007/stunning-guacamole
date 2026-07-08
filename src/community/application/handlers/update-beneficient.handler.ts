import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import {
  UpdateBeneficientAddressCommand,
  UpdateBeneficientChurchCommand,
  UpdateBeneficientCommand,
  UpdateBeneficientContactCommand,
  UpdateBeneficientPersonalCommand,
  UpdateBeneficientTaxCommand,
} from '@/community/application/command/update-beneficient.command';
import {
  UpdateProfileAddressCommand,
  UpdateProfileContactCommand,
  UpdateProfilePersonalCommand,
} from '@/community/application/command/update-profile.command';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';
import { IProfileRepository } from '@/community/domain/repositories/profile.repository';

@CommandHandler(UpdateBeneficientCommand)
export class UpdateBeneficientHandler extends BaseCommandHandler<
  UpdateBeneficientCommand,
  void
> {
  constructor(
    private readonly uow: UnitOfWork,
    @Inject(REPOSITORY_TOKENS.BENEFICIENT)
    private readonly beneficientRepository: IBeneficientRepository,
    @Inject(REPOSITORY_TOKENS.CHURCH)
    private readonly churchRepository: IChurchRepository,
    @Inject(REPOSITORY_TOKENS.PROFILE)
    private readonly profileRepository: IProfileRepository,
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
  ) {
    super();
  }

  protected async process(
    command: UpdateBeneficientCommand,
  ): Promise<Result<void>> {
    return await this.uow.runInTransaction(async () => {
      const beneficient = await this.beneficientRepository.findById(command.id);
      if (!beneficient) {
        return Result.fail({
          type: ErrorType.NOT_FOUND,
          message: 'The beneficient was not found',
          entity: UpdateBeneficientHandler.name,
        });
      }

      if (command instanceof UpdateBeneficientPersonalCommand) {
        const profileCommand = new UpdateProfilePersonalCommand(
          beneficient.profileId.unpack(),
          command.firstname,
          command.firstLastname,
          command.secondLastname,
        );
        beneficient.profile.update(profileCommand);
        await this.profileRepository.save(beneficient.profile);
        beneficient.update(command);
        await this.beneficientRepository.save(beneficient);
      } else if (command instanceof UpdateBeneficientChurchCommand) {
        const church = await this.churchRepository.findById(command.churchId);
        if (!church) {
          return Result.fail({
            type: ErrorType.NOT_FOUND,
            message: 'The church was not found',
            entity: UpdateBeneficientHandler.name,
          });
        }
        beneficient.update(command);
        await this.beneficientRepository.save(beneficient);
      } else if (command instanceof UpdateBeneficientAddressCommand) {
        const addr = beneficient.profile.address;
        const addressHash = await this.hasher.hash(
          `${command.street ?? addr.street}|${command.noExt ?? addr.numeration.noExt}|${command.noInt ?? addr.numeration.noInt}|${command.neighborhood ?? addr.neighborhood}|${command.locality ?? addr.locality}|${command.city ?? addr.city}|${command.state ?? addr.state}|${command.zipCode ?? addr.zipCode.value}|`,
          true,
        );
        const profileCommand = new UpdateProfileAddressCommand(
          beneficient.profileId.unpack(),
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
        beneficient.profile.update(profileCommand);
        await this.profileRepository.save(beneficient.profile);
      } else if (command instanceof UpdateBeneficientContactCommand) {
        const [emailHash, phoneNumberHash] = await Promise.all([
          command.email !== undefined
            ? this.hasher.hash(command.email, true)
            : Promise.resolve(undefined),
          command.phoneNumber !== undefined
            ? this.hasher.hash(command.phoneNumber, true)
            : Promise.resolve(undefined),
        ]);
        if (command.phoneNumber !== undefined) {
          const profileCommand = new UpdateProfileContactCommand(
            beneficient.profileId.unpack(),
            command.phoneNumber,
          );
          profileCommand.phoneNumberHash = phoneNumberHash;
          beneficient.profile.update(profileCommand);
          await this.profileRepository.save(beneficient.profile);
        }
        if (command.email !== undefined) {
          command.emailHash = emailHash;
          beneficient.update(command);
          await this.beneficientRepository.save(beneficient);
        }
      } else if (command instanceof UpdateBeneficientTaxCommand) {
        if (command.rfc !== undefined && command.rfc !== null) {
          command.rfcHash = await this.hasher.hash(command.rfc, true);
        }
        beneficient.update(command);
        await this.beneficientRepository.save(beneficient);
      } else {
        beneficient.update(command);
        await this.beneficientRepository.save(beneficient);
      }

      return Result.ok();
    });
  }
}
