import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';

export interface IProfilePersistence {
  id: string;
  firstname: string;
  firstLastname: string;
  secondLastname?: string;
  street: string;
  noExt: string;
  noInt?: string;
  neighborhood?: string;
  locality?: string;
  city: string;
  state: string;
  zipCode: string;
  addressHash: string;
  phoneNumber?: string;
  phoneNumberHash?: string;
  createdAt: Date;
}

export class ProfileMapper {
  public static toPersistence(profile: Profile): IProfilePersistence {
    return {
      id: profile._id.unpack(),
      firstname: profile.firstname,
      firstLastname: profile.firstLastname,
      secondLastname: profile.secondLastname,
      street: profile.address.street,
      noExt: profile.address.numeration.noExt,
      noInt: profile.address.numeration.noInt,
      neighborhood: profile.address.neighborhood,
      locality: profile.address.locality,
      city: profile.address.city,
      state: profile.address.state,
      zipCode: profile.address.zipCode.value,
      addressHash: profile.addressHash,
      phoneNumber: profile.phoneNumber?.unpack(),
      phoneNumberHash: profile.phoneNumberHash,
      createdAt: profile.createdAt,
    };
  }

  public static toDomain(raw: IProfilePersistence): Profile {
    return Profile.recreate(raw.id, {
      firstname: raw.firstname,
      firstLastname: raw.firstLastname,
      secondLastname: raw.secondLastname,
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
      phoneNumber: raw.phoneNumber ? PhoneNumber.of(raw.phoneNumber) : null,
      phoneNumberHash: raw.phoneNumberHash,
      createdAt: raw.createdAt,
    });
  }
}
