import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import {
  UpdateBeneficientAddressCommand,
  UpdateBeneficientChurchCommand,
  UpdateBeneficientCommand,
  UpdateBeneficientContactCommand,
  UpdateBeneficientTaxCommand,
} from '@/community/application/command/update-beneficient.command';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';

@CommandHandler(UpdateBeneficientCommand)
export class UpdateBeneficientHandler extends BaseCommandHandler<
  UpdateBeneficientCommand,
  void
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.BENEFICIENT)
    private readonly beneficientRepository: IBeneficientRepository,
    @Inject(REPOSITORY_TOKENS.CHURCH)
    private readonly churchRepository: IChurchRepository,
    @Inject('IBlindIndexHasher')
    private readonly hasher: IDataHasher,
  ) {
    super();
  }

  protected async process(
    command: UpdateBeneficientCommand,
  ): Promise<Result<void>> {
    const beneficient = await this.beneficientRepository.findById(command.id);
    if (!beneficient) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'The beneficient was not found',
        entity: UpdateBeneficientHandler.name,
      });
    }

    if (command instanceof UpdateBeneficientChurchCommand) {
      const church = await this.churchRepository.findById(command.churchId);
      if (!church) {
        return Result.fail({
          type: ErrorType.NOT_FOUND,
          message: 'The church was not found',
          entity: UpdateBeneficientHandler.name,
        });
      }
    } else if (command instanceof UpdateBeneficientAddressCommand) {
      const addr = beneficient.address;
      command.addressHash = await this.hasher.hash(
        `${command.street ?? addr.street}|${command.noExt ?? addr.numeration.noExt}|${command.noInt ?? addr.numeration.noInt}|${command.neighborhood ?? addr.neighborhood}|${command.locality ?? addr.locality}|${command.city ?? addr.city}|${command.state ?? addr.state}|${command.zipCode ?? addr.zipCode.value}|`,
        true,
      );
    } else if (command instanceof UpdateBeneficientContactCommand) {
      const [emailHash, phoneNumberHash] = await Promise.all([
        command.email !== undefined
          ? this.hasher.hash(command.email, true)
          : Promise.resolve(undefined),
        command.phoneNumber !== undefined
          ? this.hasher.hash(command.phoneNumber, true)
          : Promise.resolve(undefined),
      ]);
      command.emailHash = emailHash;
      command.phoneNumberHash = phoneNumberHash;
    } else if (command instanceof UpdateBeneficientTaxCommand) {
      if (command.rfc !== undefined && command.rfc !== null) {
        command.rfcHash = await this.hasher.hash(command.rfc, true);
      }
    }

    beneficient.update(command);
    await this.beneficientRepository.save(beneficient);
    return Result.ok();
  }
}
