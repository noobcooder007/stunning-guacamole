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
import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

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
          command.telephoneNumber
            ? this.hasher.hash(command.telephoneNumber, true)
            : null,
        ]);
      command.nssHash = nssHash;
      command.addressHash = addressHash;
      command.phoneNumberHash = phoneNumberHash;
      command.telephoneNumberHash = telephoneNumberHash;
      const collectorExists = await this.collectorRepository.exists({
        firstname: command.firstname,
        firstLastname: command.firstLastname,
        secondLastname: command.secondLastname,
        addressHash: command.addressHash,
        phoneNumberHash: command.phoneNumberHash,
        telephoneNumberHash: command.telephoneNumberHash,
        nssHash: command.nssHash,
      });
      if (collectorExists) {
        throw new ConflictException(
          'Collector already exists',
          CollectorMapper.name,
        );
      }
      const collectorToSave = Collector.create({
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
        addressHash: command.addressHash,
        phoneNumber: PhoneNumber.of(command.phoneNumber),
        phoneNumberHash: command.phoneNumberHash,
        telephoneNumber: command.telephoneNumber
          ? PhoneNumber.of(command.telephoneNumber)
          : null,
        telephoneNumberHash: command.telephoneNumberHash,
        nss: NSS.of(command.nss),
        nssHash: command.nssHash,
        paymentData: PaymentData.of({
          commissionPercent: command.commissionPercent,
          nomina: command.nomina,
          transportAllowance: command.transportAllowance,
          bank: command.bank,
          reference: command.reference,
        }),
        notes: command.notes,
        profilePath: command.profilePath,
        userId: UserId.of(resultCreateUser.value as string),
      });
      await this.collectorRepository.save(collectorToSave);
      collectorId = collectorToSave._id.unpack();
    });
    return Result.ok({
      id: collectorId,
    });
  }
}
