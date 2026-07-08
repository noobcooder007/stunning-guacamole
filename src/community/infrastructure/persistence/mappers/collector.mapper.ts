import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import {
  Profile,
  ProfileId,
} from '@/community/domain/aggregate/profile.aggregate';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
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
  profileId: string;
  nss: string;
  nssHash: string;
  userId: string;
  telephoneNumber?: string;
  telephoneNumberHash?: string;
  commissionPercent: number;
  nomina: number;
  transportAllowance: number;
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
      profileId: collector.profileId.unpack(),
      nss: collector.nss.value,
      nssHash: collector.nssHash,
      notes: collector.notes,
      telephoneNumber: collector.telephoneNumber?.unpack(),
      telephoneNumberHash: collector.telephoneNumberHash,
      commissionPercent: collector.paymentData.commissionPercent,
      nomina: collector.paymentData.nomina,
      transportAllowance: collector.paymentData.transportAllowance,
      bank: collector.paymentData.bank,
      reference: collector.paymentData.reference,
      userId: collector.userId.unpack(),
      createdAt: collector.createdAt,
      isActive: collector.isActive,
      profilePath: collector.profilePath,
      collectorNumber: collector.collectorNumber,
    };
  }

  public static toDomain(
    raw: ICollectorPersistence,
    profile: Profile,
  ): Collector {
    return Collector.recreate(raw.id, {
      userId: UserId.of(raw.userId),
      profileId: ProfileId.of(raw.profileId),
      profile,
      nss: NSS.of(raw.nss),
      nssHash: raw.nssHash,
      createdAt: raw.createdAt,
      isActive: raw.isActive,
      paymentData: PaymentData.of({
        bank: raw.bank,
        commissionPercent: raw.commissionPercent,
        nomina: Number(raw.nomina),
        transportAllowance: Number(raw.transportAllowance),
        reference: raw.reference,
      }),
      notes: raw.notes,
      assignations: new Set(
        (raw.assignations || []).map((a) => AssignationId.of(a.id)),
      ),
      telephoneNumber: raw.telephoneNumber
        ? PhoneNumber.of(raw.telephoneNumber)
        : null,
      telephoneNumberHash: raw.telephoneNumberHash,
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
    response.firstname = collectorModel.profile.firstname;
    response.firstLastname = collectorModel.profile.firstLastname;
    response.secondLastname = collectorModel.profile.secondLastname;
    response.nss = collectorModel.nss;
    const addressResponse = new AddressResponseDto();
    addressResponse.street = collectorModel.profile.street;
    addressResponse.noExt = collectorModel.profile.noExt;
    addressResponse.noInt = collectorModel.profile.noInt;
    addressResponse.neighborhood = collectorModel.profile.neighborhood;
    addressResponse.locality = collectorModel.profile.locality;
    addressResponse.city = collectorModel.profile.city;
    addressResponse.state = collectorModel.profile.state;
    addressResponse.zipCode = collectorModel.profile.zipCode;
    response.address = addressResponse;
    response.phoneNumber = collectorModel.profile.phoneNumber;
    response.telephoneNumber = collectorModel.telephoneNumber
      ? collectorModel.telephoneNumber
      : null;
    const paymentDataResponse = new PaymentDataResponseDto();
    paymentDataResponse.bank = collectorModel.bank;
    paymentDataResponse.commissionPercent = collectorModel.commissionPercent;
    paymentDataResponse.nomina = collectorModel.nomina;
    paymentDataResponse.transportAllowance = collectorModel.transportAllowance;
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
    response.firstname = collector.profile.firstname;
    response.firstLastname = collector.profile.firstLastname;
    response.secondLastname = collector.profile.secondLastname;
    response.nss = collector.nss.unpack();
    const addressResponse = new AddressResponseDto();
    addressResponse.street = collector.profile.address.street;
    addressResponse.noExt = collector.profile.address.numeration.noExt;
    addressResponse.noInt = collector.profile.address.numeration.noInt;
    addressResponse.neighborhood = collector.profile.address.neighborhood;
    addressResponse.locality = collector.profile.address.locality;
    addressResponse.city = collector.profile.address.city;
    addressResponse.state = collector.profile.address.state;
    addressResponse.zipCode = collector.profile.address.zipCode.unpack();
    response.address = addressResponse;
    response.phoneNumber = collector.profile.phoneNumber?.unpack();
    response.telephoneNumber = collector.telephoneNumber
      ? collector.telephoneNumber.unpack()
      : null;
    const paymentDataResponse = new PaymentDataResponseDto();
    paymentDataResponse.bank = collector.paymentData.bank;
    paymentDataResponse.commissionPercent =
      collector.paymentData.commissionPercent;
    paymentDataResponse.nomina = collector.paymentData.nomina;
    paymentDataResponse.transportAllowance =
      collector.paymentData.transportAllowance;
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
