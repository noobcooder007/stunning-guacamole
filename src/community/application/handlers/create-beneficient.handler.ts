import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';
import { IProfileRepository } from '@/community/domain/repositories/profile.repository';
import { CreateBeneficientResponse } from '@/community/application/dto/create-beneficient.response';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import { TaxInformation } from '@/community/domain/value-objects/tax-information.vo';

@CommandHandler(CreateBeneficientCommand)
export class CreateBeneficientHandler extends BaseCommandHandler<
  CreateBeneficientCommand,
  CreateBeneficientResponse
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
    command: CreateBeneficientCommand,
  ): Promise<Result<CreateBeneficientResponse>> {
    return await this.uow.runInTransaction(async () => {
      const [addressHash, emailHash, rfcHash, phoneNumberHash, church] =
        await Promise.all([
          this.hasher.hash(
            `${command.street}|${command.noExt}|${command.noInt}|${command.neighborhood}|${command.locality}|${command.city}|${command.state}|${command.zipCode}|`,
            true,
          ),
          command.email ? this.hasher.hash(command.email, true) : null,
          command.rfc ? this.hasher.hash(command.rfc, true) : null,
          command.phoneNumber
            ? this.hasher.hash(command.phoneNumber, true)
            : null,
          this.churchRepository.findById(command.churchId),
        ]);
      if (!church) {
        return Result.fail({
          type: ErrorType.NOT_FOUND,
          message: 'The church was not found',
          entity: CreateBeneficientHandler.name,
        });
      }
      const profileExists = await this.profileRepository.exists({
        firstname: command.firstname,
        firstLastname: command.firstLastname,
        secondLastname: command.secondLastname,
        addressHash,
        phoneNumberHash,
      });
      if (profileExists) {
        return Result.fail({
          type: ErrorType.CONFLICT,
          message: 'The beneficient already exists',
          entity: CreateBeneficientHandler.name,
        });
      }
      const beneficientExists = await this.beneficientRepository.exists({
        emailHash,
        rfcHash,
      });
      if (beneficientExists) {
        return Result.fail({
          type: ErrorType.CONFLICT,
          message: 'The beneficient already exists',
          entity: CreateBeneficientHandler.name,
        });
      }
      const profile = Profile.create({
        firstname: command.firstname,
        firstLastname: command.firstLastname,
        secondLastname: command.secondLastname,
        address: Address.of({
          street: command.street,
          numeration: Numeration.of({
            noExt: command.noExt,
            noInt: command.noInt,
          }),
          neighborhood: command.neighborhood,
          locality: command.locality,
          city: command.city,
          state: command.state,
          zipCode: ZipCode.of(command.zipCode),
        }),
        addressHash,
        phoneNumber: command.phoneNumber
          ? PhoneNumber.of(command.phoneNumber)
          : null,
        phoneNumberHash,
      });
      await this.profileRepository.save(profile);
      const beneficient = Beneficient.create({
        ...command,
        profileId: profile._id,
        profile,
        emailHash,
        church: ChurchId.of(command.churchId),
        taxInformation: command.person
          ? TaxInformation.of({
              person: command.person,
              registeredName: command.registeredName,
              rfc: command.rfc,
              rfcHash: rfcHash,
            })
          : null,
      });
      await this.beneficientRepository.save(beneficient);
      return Result.ok({
        id: beneficient._id.unpack(),
      });
    });
  }
}
