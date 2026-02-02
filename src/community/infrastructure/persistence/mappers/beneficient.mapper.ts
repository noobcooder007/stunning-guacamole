import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';
import { BeneficientResponse } from '@/community/application/dto/beneficient.response';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import { TaxInformation } from '@/community/domain/value-objects/tax-information.vo';

export interface IBeneficientPersistence {
  id: string;
  title: string;
  firstname: string;
  firstLastname: string;
  secondLastname: string;
  birthday: Date;
  genre: string;
  maritalStatus: string;
  weddingAniversary: Date;
  street: string;
  noExt: string;
  noInt?: string;
  neighborhood?: string;
  locality?: string;
  city: string;
  state: string;
  zipCode: string;
  churchId: string;
  email?: string;
  person?: string;
  registeredName?: string;
  rfc?: string;
  createdAt: Date;
  isActive: boolean;
  reasonDeactivated?: string;
}

export class BeneficientMapper {
  static toPersistence(beneficient: Beneficient): IBeneficientPersistence {
    return {
      id: beneficient._id.unpack(),
      title: beneficient.title,
      firstname: beneficient.firstname,
      firstLastname: beneficient.firstLastname,
      secondLastname: beneficient.secondLastname,
      birthday: beneficient.birthday,
      genre: beneficient.genre,
      maritalStatus: beneficient.maritalStatus,
      weddingAniversary: beneficient.weddingAniversary,
      street: beneficient.address.street,
      noExt: beneficient.address.numeration.noExt,
      noInt: beneficient.address.numeration.noInt,
      neighborhood: beneficient.address.neighborhood,
      locality: beneficient.address.locality,
      city: beneficient.address.city,
      state: beneficient.address.state,
      zipCode: beneficient.address.zipCode.value,
      churchId: beneficient.church.unpack(),
      email: beneficient.email,
      person: beneficient.taxInformation.unpack().person,
      registeredName: beneficient.taxInformation.unpack().registeredName,
      rfc: beneficient.taxInformation.unpack().rfc,
      createdAt: beneficient.createdAt,
      isActive: beneficient.isActive,
      reasonDeactivated: beneficient.reasonDeactivated,
    };
  }

  static commandToDomain(raw: CreateBeneficientCommand): Beneficient {
    return Beneficient.create({
      title: raw.title,
      firstname: raw.firstname,
      firstLastname: raw.firstLastname,
      secondLastname: raw.secondLastname,
      birthday: raw.birthday,
      genre: raw.genre,
      maritalStatus: raw.maritalStatus,
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
      createdAt: new Date(),
      isActive: true,
      weddingAniversary: raw.weddingAniversary,
      church: ChurchId.of(raw.churchId),
      email: raw.email,
      taxInformation: TaxInformation.of({
        person: raw.person,
        registeredName: raw.registeredName,
        rfc: raw.rfc,
      }),
    });
  }

  static toDomain(raw: IBeneficientPersistence): Beneficient {
    return Beneficient.recreate(raw.id, {
      title: raw.title,
      firstname: raw.firstname,
      firstLastname: raw.firstLastname,
      secondLastname: raw.secondLastname,
      birthday: raw.birthday,
      genre: raw.genre,
      maritalStatus: raw.maritalStatus,
      weddingAniversary: raw.weddingAniversary,
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
      taxInformation: TaxInformation.of({
        person: raw.person,
        registeredName: raw.registeredName,
        rfc: raw.rfc,
      }),
      email: raw.email,
      createdAt: raw.createdAt,
      isActive: raw.isActive,
      church: ChurchId.of(raw.churchId),
    });
  }

  static fromModelToResponse(
    beneficientModel: IBeneficientPersistence,
  ): BeneficientResponse {
    const beneficient = new BeneficientResponse();
    beneficient.id = beneficientModel.id;
    beneficient.title = beneficientModel.title;
    beneficient.firstname = beneficientModel.firstname;
    beneficient.firstLastname = beneficientModel.firstLastname;
    beneficient.secondLastname = beneficientModel.secondLastname;
    beneficient.birthday = beneficientModel.birthday;
    beneficient.genre = beneficientModel.genre;
    beneficient.maritalStatus = beneficientModel.maritalStatus;
    beneficient.address = Address.of({
      street: beneficientModel.street,
      numeration: Numeration.of({
        noExt: beneficientModel.noExt,
        noInt: beneficientModel.noInt,
      }),
      neighborhood: beneficientModel.neighborhood,
      locality: beneficientModel.locality,
      city: beneficientModel.city,
      state: beneficientModel.state,
      zipCode: ZipCode.of(beneficientModel.zipCode),
    });
    beneficient.weddingAniversary = beneficientModel.weddingAniversary;
    beneficient.createdAt = beneficientModel.createdAt;
    beneficient.isActive = beneficientModel.isActive;
    return beneficient;
  }
}
