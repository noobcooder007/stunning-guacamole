import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CreateChurchCommand } from '../command/create-church.command';
import { Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ConflictException } from '@/shared/domain/exceptions/conflict-exception.exception';
import { Church } from '@/community/domain/aggregate/church.aggregate';
import { EcclesialIdentity } from '@/community/domain/value-objects/ecclesial-identity.vo';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { Priest } from '@/community/domain/value-objects/priest.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';

@CommandHandler(CreateChurchCommand)
export class CreateChurchHandler extends BaseCommandHandler<
  CreateChurchCommand,
  { id: string }
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.CHURCH)
    private readonly churchRepository: IChurchRepository,
  ) {
    super();
  }

  protected async process(
    command: CreateChurchCommand,
  ): Promise<Result<{ id: string }>> {
    const church = Church.create({
      ecclesialIdentity: EcclesialIdentity.of({
        name: command.ecclesialIdentity.name,
        vicaria: command.ecclesialIdentity.vicaria,
        decanato: command.ecclesialIdentity.decanato,
        parroquia: command.ecclesialIdentity.parroquia,
        capilla: command.ecclesialIdentity.capilla,
      }),
      address: Address.of({
        street: command.address.street,
        numeration: Numeration.of({
          noExt: command.address.noExt,
          noInt: command.address.noInt,
        }),
        neighborhood: command.address.neighborhood,
        city: command.address.city,
        state: command.address.state,
        zipCode: ZipCode.of(command.address.zipCode),
      }),
      priest: Priest.of({
        firstname: command.priest.firstname,
        firstLastname: command.priest.firstLastname,
        secondLastname: command.priest.secondLastname,
      }),
      auxiliarPriest: Priest.of({
        firstname: command.auxiliarPriest.firstname,
        firstLastname: command.auxiliarPriest.firstLastname,
        secondLastname: command.auxiliarPriest.secondLastname,
      }),
      phoneNumber: PhoneNumber.of(command.phoneNumber),
      isActive: true,
      createdAt: new Date(),
    });
    const exists = await this.churchRepository.exists(church);
    if (exists) {
      throw new ConflictException(
        'Church already exists',
        CreateChurchHandler.name,
      );
    }
    await this.churchRepository.save(church);
    return Result.ok({
      id: church._id.unpack(),
    });
  }
}
