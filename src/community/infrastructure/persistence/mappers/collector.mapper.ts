import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import { CollectorResponse } from '@/community/application/dto/collector.response';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { AssignationId } from '@/community/domain/aggregate/assignation.aggregate';
import { IAssignationPersistence } from '@/community/infrastructure/persistence/mappers/assignation.mapper';
import { AddressResponseDto } from '@/community/application/dto/address.response';
import { PaymentDataResponseDto } from '@/community/application/dto/payment-data.response';

export interface ICollectorPersistence {
  id: string;
  firstname: string;
  firstLastname: string;
  secondLastname?: string;
  nss: string;
  nssHash: string;
  street: string;
  noExt: string;
  noInt?: string;
  neighborhood?: string;
  locality?: string;
  city: string;
  state: string;
  zipCode: string;
  addressHash: string;
  userId: string;
  phoneNumber: string;
  phoneNumberHash: string;
  telephoneNumber?: string;
  telephoneNumberHash?: string;
  commissionPercent: number;
  bank?: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
  isActive: boolean;
  assignations?: IAssignationPersistence[];
  profilePath: string;
  collectorNumber: number;
}

export class CollectorMapper {
  public static toPersistence(collector: Collector): ICollectorPersistence {
    return {
      id: collector._id.unpack(),
      firstname: collector.firstname,
      firstLastname: collector.firstLastname,
      secondLastname: collector.secondLastname,
      nss: collector.nss.value,
      nssHash: collector.nssHash,
      notes: collector.notes,
      street: collector.address.street,
      noExt: collector.address.numeration.noExt,
      noInt: collector.address.numeration.noInt,
      neighborhood: collector.address.neighborhood,
      locality: collector.address.locality,
      city: collector.address.city,
      state: collector.address.state,
      zipCode: collector.address.zipCode.value,
      addressHash: collector.addressHash,
      phoneNumber: collector.phoneNumber.unpack(),
      phoneNumberHash: collector.phoneNumberHash,
      telephoneNumber: collector.telephoneNumber?.unpack(),
      telephoneNumberHash: collector.telephoneNumberHash,
      commissionPercent: collector.paymentData.commissionPercent,
      bank: collector.paymentData.bank,
      reference: collector.paymentData.reference,
      userId: collector.userId.unpack(),
      createdAt: collector.createdAt,
      isActive: collector.isActive,
      profilePath: collector.profilePath,
      collectorNumber: collector.collectorNumber,
    };
  }

  public static toDomain(raw: ICollectorPersistence): Collector {
    return Collector.recreate(raw.id, {
      userId: UserId.of(raw.userId),
      firstname: raw.firstname,
      firstLastname: raw.firstLastname,
      secondLastname: raw.secondLastname,
      nss: NSS.of(raw.nss),
      nssHash: raw.nssHash,
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
      createdAt: raw.createdAt,
      isActive: raw.isActive,
      phoneNumber: PhoneNumber.of(raw.phoneNumber),
      phoneNumberHash: raw.phoneNumberHash,
      paymentData: PaymentData.of({
        bank: raw.bank,
        commissionPercent: raw.commissionPercent,
        reference: raw.reference,
      }),
      notes: raw.notes,
      assignations: new Set(
        (raw.assignations || []).map((a) => AssignationId.of(a.id)),
      ),
      telephoneNumber: raw.telephoneNumber
        ? PhoneNumber.of(raw.telephoneNumber)
        : null,
      profilePath: raw.profilePath,
      collectorNumber: raw.collectorNumber,
    });
  }

  public static fromModelToResponse(
    collectorModel: CollectorSchema,
  ): CollectorResponse {
    const response = new CollectorResponse();
    response.id = collectorModel.id;
    response.userId = collectorModel.userId;
    response.firstname = collectorModel.firstname;
    response.firstLastname = collectorModel.firstLastname;
    response.secondLastname = collectorModel.secondLastname;
    response.nss = collectorModel.nss;
    const addressResponse = new AddressResponseDto();
    addressResponse.street = collectorModel.street;
    addressResponse.noExt = collectorModel.noExt;
    addressResponse.noInt = collectorModel.noInt;
    addressResponse.neighborhood = collectorModel.neighborhood;
    addressResponse.locality = collectorModel.locality;
    addressResponse.city = collectorModel.city;
    addressResponse.state = collectorModel.state;
    addressResponse.zipCode = collectorModel.zipCode;
    response.address = addressResponse;
    response.phoneNumber = collectorModel.phoneNumber;
    response.telephoneNumber = collectorModel.telephoneNumber
      ? collectorModel.telephoneNumber
      : null;
    const paymentDataResponse = new PaymentDataResponseDto();
    paymentDataResponse.bank = collectorModel.bank;
    paymentDataResponse.commissionPercent = collectorModel.commissionPercent;
    paymentDataResponse.reference = collectorModel.reference;
    response.paymentData = paymentDataResponse;
    response.notes = collectorModel.notes;
    response.createdAt = collectorModel.createdAt;
    response.isActive = collectorModel.isActive;
    response.profilePath = collectorModel.profilePath;
    response.collectorNumber = collectorModel.collectorNumber;
    return response;
  }

  public static fromDomainToResponse(collector: Collector): CollectorResponse {
    const response = new CollectorResponse();
    response.id = collector._id.unpack();
    response.userId = collector.userId.unpack();
    response.firstname = collector.firstname;
    response.firstLastname = collector.firstLastname;
    response.secondLastname = collector.secondLastname;
    response.nss = collector.nss.unpack();
    const addressResponse = new AddressResponseDto();
    addressResponse.street = collector.address.street;
    addressResponse.noExt = collector.address.numeration.noExt;
    addressResponse.noInt = collector.address.numeration.noInt;
    addressResponse.neighborhood = collector.address.neighborhood;
    addressResponse.locality = collector.address.locality;
    addressResponse.city = collector.address.city;
    addressResponse.state = collector.address.state;
    addressResponse.zipCode = collector.address.zipCode.unpack();
    response.address = addressResponse;
    response.phoneNumber = collector.phoneNumber.unpack();
    response.telephoneNumber = collector.telephoneNumber
      ? collector.telephoneNumber.unpack()
      : null;
    const paymentDataResponse = new PaymentDataResponseDto();
    paymentDataResponse.bank = collector.paymentData.bank;
    paymentDataResponse.commissionPercent =
      collector.paymentData.commissionPercent;
    paymentDataResponse.reference = collector.paymentData.reference;
    response.paymentData = paymentDataResponse;
    response.notes = collector.notes;
    response.createdAt = collector.createdAt;
    response.isActive = collector.isActive;
    response.profilePath = collector.profilePath;
    response.collectorNumber = collector.collectorNumber;
    return response;
  }
}
