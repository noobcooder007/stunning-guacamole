import { Church } from '@/community/domain/aggregate/church.aggregate';
import { ChurchSchema } from '../typeorm/schemas/church.schema';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { Priest } from '@/community/domain/value-objects/priest.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { ChurchResponse } from '@/community/application/dto/church.response';
import { EcclesialIdentity } from '@/community/domain/value-objects/ecclesial-identity.vo';

export interface IChurchPersistence {
  id: string;
  name: string;
  vicaria: string;
  decanato: string;
  parroquia: string;
  capilla: string;
  street: string;
  noExt: string;
  noInt: string;
  neighborhood: string;
  locality: string;
  city: string;
  state: string;
  zipCode: string;
  priestFirstname: string;
  priestFirstLastname: string;
  priestSecondLastname: string;
  auxiliarPriestFirstname: string;
  auxiliarPriestFirstLastname: string;
  auxiliarPriestSecondLastname: string;
  phoneNumber: string;
  createdAt: Date;
  isActive: boolean;
}

export class ChurchMapper {
  public static toPersistence(church: Church): IChurchPersistence {
    return {
      id: church._id.unpack(),
      name: church.ecclesialIdentity.unpack().name,
      vicaria: church.ecclesialIdentity.unpack().vicaria,
      decanato: church.ecclesialIdentity.unpack().decanato,
      parroquia: church.ecclesialIdentity.unpack().parroquia,
      capilla: church.ecclesialIdentity.unpack().capilla,
      street: church.address.unpack().street,
      noExt: church.address.unpack().numeration.unpack().noExt,
      noInt: church.address.unpack().numeration.unpack().noInt,
      neighborhood: church.address.unpack().neighborhood,
      locality: church.address.unpack().locality,
      city: church.address.unpack().city,
      state: church.address.unpack().state,
      zipCode: church.address.unpack().zipCode.value,
      priestFirstname: church.priest.unpack().firstname,
      priestFirstLastname: church.priest.unpack().firstLastname,
      priestSecondLastname: church.priest.unpack().secondLastname,
      auxiliarPriestFirstname: church.auxiliarPriest.unpack().firstname,
      auxiliarPriestFirstLastname: church.auxiliarPriest.unpack().firstLastname,
      auxiliarPriestSecondLastname:
        church.auxiliarPriest.unpack().secondLastname,
      phoneNumber: church.phoneNumber.unpack(),
      createdAt: church.createdAt,
      isActive: church.isActive,
    };
  }

  public static toDomain(raw: ChurchSchema): Church {
    return Church.recreate(raw.id, {
      ecclesialIdentity: EcclesialIdentity.of({
        name: raw.name,
        vicaria: raw.vicaria,
        decanato: raw.decanato,
        parroquia: raw.parroquia,
        capilla: raw.capilla,
      }),
      address: Address.of({
        street: raw.street,
        numeration: Numeration.of({
          noExt: raw.noExt,
          noInt: raw.noInt,
        }),
        neighborhood: raw.neighborhood,
        locality: raw.locality,
        city: raw.city,
        state: raw.state,
        zipCode: ZipCode.of(raw.zipCode),
      }),
      priest: Priest.of({
        firstname: raw.priestFirstname,
        firstLastname: raw.priestFirstLastname,
        secondLastname: raw.priestSecondLastname,
      }),
      auxiliarPriest: Priest.of({
        firstname: raw.auxiliarPriestFirstname,
        firstLastname: raw.auxiliarPriestFirstLastname,
        secondLastname: raw.auxiliarPriestSecondLastname,
      }),
      phoneNumber: PhoneNumber.of(raw.phoneNumber),
      isActive: raw.isActive,
      createdAt: raw.createdAt,
    });
  }

  public static fromDomainToResponse(church: Church): ChurchResponse {
    const response = new ChurchResponse();
    response.id = church._id.unpack();
    response.ecclesialIdentity = church.ecclesialIdentity;
    response.address = church.address;
    response.priest = church.priest;
    response.auxiliarPriest = church.auxiliarPriest;
    response.phoneNumber = church.phoneNumber;
    return response;
  }

  public static fromModelToResponse(churchModel: ChurchSchema): ChurchResponse {
    const response = new ChurchResponse();
    response.id = churchModel.id;
    response.ecclesialIdentity = EcclesialIdentity.of({
      name: churchModel.name,
      vicaria: churchModel.vicaria,
      decanato: churchModel.decanato,
      parroquia: churchModel.parroquia,
      capilla: churchModel.capilla,
    });
    response.address = Address.of({
      street: churchModel.street,
      numeration: Numeration.of({
        noExt: churchModel.noExt,
        noInt: churchModel.noInt,
      }),
      neighborhood: churchModel.neighborhood,
      locality: churchModel.locality,
      city: churchModel.city,
      state: churchModel.state,
      zipCode: ZipCode.of(churchModel.zipCode),
    });
    response.priest = Priest.of({
      firstname: churchModel.priestFirstname,
      firstLastname: churchModel.priestFirstLastname,
      secondLastname: churchModel.priestSecondLastname,
    });
    response.auxiliarPriest = Priest.of({
      firstname: churchModel.auxiliarPriestFirstname,
      firstLastname: churchModel.auxiliarPriestFirstLastname,
      secondLastname: churchModel.auxiliarPriestSecondLastname,
    });
    response.phoneNumber = PhoneNumber.of(churchModel.phoneNumber);
    return response;
  }
}
