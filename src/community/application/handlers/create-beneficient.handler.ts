import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';
import { CreateBeneficientResponse } from '@/community/application/dto/create-beneficient.response';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';

@CommandHandler(CreateBeneficientCommand)
export class CreateBeneficientHandler extends BaseCommandHandler<
  CreateBeneficientCommand,
  CreateBeneficientResponse
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
    command: CreateBeneficientCommand,
  ): Promise<Result<CreateBeneficientResponse>> {
    const [addressHash, emailHash, rfcHash, church] = await Promise.all([
      this.hasher.hash(
        `${command.street}|${command.noExt}|${command.noInt}|${command.neighborhood}|${command.locality}|${command.city}|${command.state}|${command.zipCode}|`,
        true,
      ),
      this.hasher.hash(command.email, true),
      this.hasher.hash(command.rfc, true),
      this.churchRepository.findById(command.churchId),
    ]);
    if (!church) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'The church was not found',
        entity: CreateBeneficientHandler.name,
      });
    }
    command.addressHash = addressHash;
    command.emailHash = emailHash;
    command.rfcHash = rfcHash;
    const [exists] = await Promise.all([
      this.beneficientRepository.exists({ ...command }),
    ]);
    if (exists) {
      return Result.fail({
        type: ErrorType.CONFLICT,
        message: 'The beneficient already exists',
        entity: CreateBeneficientHandler.name,
      });
    }
    const beneficient = Beneficient.create({
      ...command,
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
      church: ChurchId.of(command.churchId),
      createdAt: undefined,
      isActive: false,
    });
    await this.beneficientRepository.save(beneficient);
    return Result.ok({
      id: beneficient._id.unpack(),
    });
  }
}
