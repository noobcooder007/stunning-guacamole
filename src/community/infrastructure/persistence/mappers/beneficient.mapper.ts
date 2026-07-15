import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import {
  Profile,
  ProfileId,
} from '@/community/domain/aggregate/profile.aggregate';
import { BeneficientSchema } from '@/community/infrastructure/persistence/typeorm/schemas/beneficient.schema';
import { BeneficientResponse } from '@/community/application/dto/beneficient.response';
import { BeneficientChurchResponse } from '@/community/application/dto/beneficient-church.response';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import { TaxInformation } from '@/community/domain/value-objects/tax-information.vo';
import { AddressResponseDto } from '@/community/application/dto/address.response';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

export interface IBeneficientPersistence {
  id: string;
  title: string;
  profileId: string;
  birthday: Date;
  genre: string;
  maritalStatus: string;
  weddingAnniversary: Date;
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
  deactivatedAt?: Date | null;
  beneficientNumber: number;
  keepPrivate: boolean;
  userId?: string;
}

export class BeneficientMapper {
  static toPersistence(beneficient: Beneficient): IBeneficientPersistence {
    return {
      id: beneficient._id.unpack(),
      title: beneficient.title,
      profileId: beneficient.profileId.unpack(),
      birthday: beneficient.birthday,
      genre: beneficient.genre,
      maritalStatus: beneficient.maritalStatus,
      weddingAnniversary: beneficient.weddingAniversary,
      churchId: beneficient.church.unpack(),
      email: beneficient.email,
      emailHash: beneficient.emailHash,
      person: beneficient.taxInformation?.unpack().person ?? null,
      registeredName:
        beneficient.taxInformation?.unpack().registeredName ?? null,
      rfc: beneficient.taxInformation?.unpack().rfc ?? null,
      rfcHash: beneficient.taxInformation?.unpack().rfcHash ?? null,
      createdAt: beneficient.createdAt,
      isActive: beneficient.isActive,
      reasonDeactivated: beneficient.reasonDeactivated,
      deactivatedAt: beneficient.deactivatedAt,
      beneficientNumber: beneficient.beneficientNumber,
      keepPrivate: beneficient.keepPrivate,
      userId: beneficient.userId?.unpack(),
    };
  }

  static toDomain(raw: IBeneficientPersistence, profile: Profile): Beneficient {
    return Beneficient.recreate(raw.id, {
      title: raw.title,
      profileId: ProfileId.of(raw.profileId),
      profile,
      birthday: raw.birthday,
      genre: raw.genre,
      maritalStatus: raw.maritalStatus,
      weddingAniversary: raw.weddingAnniversary,
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
      reasonDeactivated: raw.reasonDeactivated,
      deactivatedAt: raw.deactivatedAt,
      church: ChurchId.of(raw.churchId),
      beneficientNumber: raw.beneficientNumber,
      keepPrivate: raw.keepPrivate,
      userId: raw.userId ? UserId.of(raw.userId) : undefined,
    });
  }

  static fromModelToResponse(
    beneficientModel: BeneficientSchema,
  ): BeneficientResponse {
    const beneficient = new BeneficientResponse();
    beneficient.id = beneficientModel.id;
    const churchResponse = new BeneficientChurchResponse();
    churchResponse.id = beneficientModel.churchId;
    beneficient.church = churchResponse;
    beneficient.title = beneficientModel.title;
    beneficient.firstname = beneficientModel.profile.firstname;
    beneficient.firstLastname = beneficientModel.profile.firstLastname;
    beneficient.secondLastname = beneficientModel.profile.secondLastname;
    beneficient.birthday = beneficientModel.birthday;
    beneficient.weddingAniversary = beneficientModel.weddingAnniversary;
    beneficient.genre = beneficientModel.genre;
    beneficient.maritalStatus = beneficientModel.maritalStatus;
    const addressResponse = new AddressResponseDto();
    addressResponse.street = beneficientModel.profile.street;
    addressResponse.noExt = beneficientModel.profile.noExt;
    addressResponse.noInt = beneficientModel.profile.noInt;
    addressResponse.neighborhood = beneficientModel.profile.neighborhood;
    addressResponse.locality = beneficientModel.profile.locality;
    addressResponse.city = beneficientModel.profile.city;
    addressResponse.state = beneficientModel.profile.state;
    addressResponse.zipCode = beneficientModel.profile.zipCode;
    beneficient.address = addressResponse;
    beneficient.email = beneficientModel.email;
    beneficient.phoneNumber = beneficientModel.profile.phoneNumber;
    beneficient.person = beneficientModel.person;
    beneficient.registeredName = beneficientModel.registeredName;
    beneficient.rfc = beneficientModel.rfc;
    beneficient.createdAt = beneficientModel.createdAt;
    beneficient.isActive = beneficientModel.isActive;
    beneficient.beneficientNumber = beneficientModel.beneficientNumber;
    return beneficient;
  }

  static fromDomainToResponse(beneficient: Beneficient): BeneficientResponse {
    const beneficientResponse = new BeneficientResponse();
    beneficientResponse.id = beneficient._id.unpack();
    const churchResponse = new BeneficientChurchResponse();
    churchResponse.id = beneficient.church.unpack();
    beneficientResponse.church = churchResponse;
    beneficientResponse.title = beneficient.title;
    beneficientResponse.firstname = beneficient.profile.firstname;
    beneficientResponse.firstLastname = beneficient.profile.firstLastname;
    beneficientResponse.secondLastname = beneficient.profile.secondLastname;
    beneficientResponse.birthday = beneficient.birthday;
    beneficientResponse.weddingAniversary = beneficient.weddingAniversary;
    beneficientResponse.genre = beneficient.genre;
    beneficientResponse.maritalStatus = beneficient.maritalStatus;
    const addressResponse = new AddressResponseDto();
    addressResponse.street = beneficient.profile.address.street;
    addressResponse.noExt = beneficient.profile.address.numeration.noExt;
    addressResponse.noInt = beneficient.profile.address.numeration.noInt;
    addressResponse.neighborhood = beneficient.profile.address.neighborhood;
    addressResponse.locality = beneficient.profile.address.locality;
    addressResponse.city = beneficient.profile.address.city;
    addressResponse.state = beneficient.profile.address.state;
    addressResponse.zipCode = beneficient.profile.address.zipCode.unpack();
    beneficientResponse.address = addressResponse;
    beneficientResponse.email = beneficient.email;
    beneficientResponse.phoneNumber =
      beneficient.profile.phoneNumber?.unpack();
    beneficientResponse.person = beneficient.taxInformation.unpack().person;
    beneficientResponse.registeredName =
      beneficient.taxInformation.unpack().registeredName;
    beneficientResponse.rfc = beneficient.taxInformation.unpack().rfc;
    beneficientResponse.createdAt = beneficient.createdAt;
    beneficientResponse.isActive = beneficient.isActive;
    beneficientResponse.beneficientNumber = beneficient.beneficientNumber;
    return beneficientResponse;
  }
}
