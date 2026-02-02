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
import { AddressResponseDto } from '@/community/application/dto/address.response';

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
  addressHash: string;
  churchId: string;
  email?: string;
  emailHash?: string;
  person?: string;
  registeredName?: string;
  rfc?: string;
  rfcHash?: string;
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
      addressHash: beneficient.addressHash,
      churchId: beneficient.church.unpack(),
      email: beneficient.email,
      emailHash: beneficient.emailHash,
      person: beneficient.taxInformation.unpack().person,
      registeredName: beneficient.taxInformation.unpack().registeredName,
      rfc: beneficient.taxInformation.unpack().rfc,
      rfcHash: beneficient.taxInformation.unpack().rfcHash,
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
      addressHash: raw.addressHash,
      createdAt: new Date(),
      isActive: true,
      weddingAniversary: raw.weddingAniversary,
      church: ChurchId.of(raw.churchId),
      email: raw.email,
      emailHash: raw.emailHash,
      taxInformation: TaxInformation.of({
        person: raw.person,
        registeredName: raw.registeredName,
        rfc: raw.rfc,
        rfcHash: raw.rfcHash,
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
      addressHash: raw.addressHash,
      taxInformation: TaxInformation.of({
        person: raw.person,
        registeredName: raw.registeredName,
        rfc: raw.rfc,
        rfcHash: raw.rfcHash,
      }),
      email: raw.email,
      emailHash: raw.emailHash,
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
    beneficient.weddingAniversary = beneficientModel.weddingAniversary;
    beneficient.genre = beneficientModel.genre;
    beneficient.maritalStatus = beneficientModel.maritalStatus;
    const addressResponse = new AddressResponseDto();
    addressResponse.street = beneficientModel.street;
    addressResponse.noExt = beneficientModel.noExt;
    addressResponse.noInt = beneficientModel.noInt;
    addressResponse.neighborhood = beneficientModel.neighborhood;
    addressResponse.locality = beneficientModel.locality;
    addressResponse.city = beneficientModel.city;
    addressResponse.state = beneficientModel.state;
    addressResponse.zipCode = beneficientModel.zipCode;
    beneficient.address = addressResponse;
    beneficient.email = beneficientModel.email;
    beneficient.person = beneficientModel.person;
    beneficient.registeredName = beneficientModel.registeredName;
    beneficient.rfc = beneficientModel.rfc;
    beneficient.createdAt = beneficientModel.createdAt;
    beneficient.isActive = beneficientModel.isActive;
    return beneficient;
  }

  static fromDomainToResponse(beneficient: Beneficient): BeneficientResponse {
    const beneficientResponse = new BeneficientResponse();
    beneficientResponse.id = beneficient._id.unpack();
    beneficientResponse.title = beneficient.title;
    beneficientResponse.firstname = beneficient.firstname;
    beneficientResponse.firstLastname = beneficient.firstLastname;
    beneficientResponse.secondLastname = beneficient.secondLastname;
    beneficientResponse.birthday = beneficient.birthday;
    beneficientResponse.weddingAniversary = beneficient.weddingAniversary;
    beneficientResponse.genre = beneficient.genre;
    beneficientResponse.maritalStatus = beneficient.maritalStatus;
    const addressResponse = new AddressResponseDto();
    addressResponse.street = beneficient.address.street;
    addressResponse.noExt = beneficient.address.numeration.noExt;
    addressResponse.noInt = beneficient.address.numeration.noInt;
    addressResponse.neighborhood = beneficient.address.neighborhood;
    addressResponse.locality = beneficient.address.locality;
    addressResponse.city = beneficient.address.city;
    addressResponse.state = beneficient.address.state;
    addressResponse.zipCode = beneficient.address.zipCode.unpack();
    beneficientResponse.address = addressResponse;
    beneficientResponse.email = beneficient.email;
    beneficientResponse.person = beneficient.taxInformation.unpack().person;
    beneficientResponse.registeredName =
      beneficient.taxInformation.unpack().registeredName;
    beneficientResponse.rfc = beneficient.taxInformation.unpack().rfc;
    beneficientResponse.createdAt = beneficient.createdAt;
    beneficientResponse.isActive = beneficient.isActive;
    return beneficientResponse;
  }
}
