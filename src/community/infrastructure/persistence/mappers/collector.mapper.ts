import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { CreateCollectorCommand } from '@/community/application/command/create-collector.command';
import { CollectorSchema } from '@/community/infrastructure/persistence/typeorm/schemas/collector.schema';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import { CollectorResponse } from '@/community/application/dto/collector.response';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { AssignationId } from '@/community/domain/aggregate/assignation.aggregate';
import { IAssignationPersistence } from '@/community/infrastructure/persistence/mappers/assignation.mapper';

export interface ICollectorPersistence {
  id: string;
  firstname: string;
  firstLastname: string;
  secondLastname?: string;
  nss: string;
  street: string;
  noExt: string;
  noInt?: string;
  neighborhood?: string;
  locality?: string;
  city: string;
  state: string;
  zipCode: string;
  userId: string;
  phoneNumber: string;
  telephoneNumber?: string;
  commissionPercent: number;
  bank: string;
  reference: string;
  notes?: string;
  createdAt: Date;
  isActive: boolean;
  assignations?: IAssignationPersistence[];
}

export class CollectorMapper {
  public static toPersistence(collector: Collector): ICollectorPersistence {
    return {
      id: collector._id.unpack(),
      firstname: collector.firstname,
      firstLastname: collector.firstLastname,
      secondLastname: collector.secondLastname,
      nss: collector.nss.value,
      notes: collector.notes,
      street: collector.address.street,
      noExt: collector.address.numeration.noExt,
      noInt: collector.address.numeration.noInt,
      neighborhood: collector.address.neighborhood,
      locality: collector.address.locality,
      city: collector.address.city,
      state: collector.address.state,
      zipCode: collector.address.zipCode.value,
      phoneNumber: collector.phoneNumber.unpack(),
      telephoneNumber: collector.telephoneNumber?.unpack(),
      commissionPercent: collector.paymentData.commissionPercent,
      bank: collector.paymentData.bank,
      reference: collector.paymentData.reference,
      userId: collector.userId.unpack(),
      createdAt: collector.createdAt,
      isActive: collector.isActive,
    };
  }

  public static commandToDomain(
    raw: CreateCollectorCommand,
    userId: string,
  ): Collector {
    return Collector.create({
      userId: UserId.of(userId),
      firstname: raw.firstname,
      firstLastname: raw.firstLastname,
      secondLastname: raw.secondLastname,
      nss: NSS.of(raw.nss),
      phoneNumber: PhoneNumber.of(raw.phoneNumber),
      paymentData: PaymentData.of({
        commissionPercent: raw.commissionPercent,
        bank: raw.bank,
        reference: raw.reference,
      }),
      notes: raw.notes,
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
    });
  }

  public static toDomain(raw: ICollectorPersistence): Collector {
    return Collector.recreate(raw.id, {
      userId: UserId.of(raw.userId),
      firstname: raw.firstname,
      firstLastname: raw.firstLastname,
      secondLastname: raw.secondLastname,
      nss: NSS.of(raw.nss),
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
      createdAt: raw.createdAt,
      isActive: raw.isActive,
      phoneNumber: PhoneNumber.of(raw.phoneNumber),
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
    });
  }

  public static fromModelToResponse(
    collectorModel: CollectorSchema,
  ): CollectorResponse {
    const response = new CollectorResponse();
    response.id = collectorModel.id;
    response.firstname = collectorModel.firstname;
    response.firstLastname = collectorModel.firstLastname;
    response.secondLastname = collectorModel.secondLastname;
    response.nss = collectorModel.nss;
    response.street = collectorModel.street;
    response.noExt = collectorModel.noExt;
    response.noInt = collectorModel.noInt;
    response.neighborhood = collectorModel.neighborhood;
    response.locality = collectorModel.locality;
    response.city = collectorModel.city;
    response.state = collectorModel.state;
    response.zipCode = collectorModel.zipCode;
    response.phoneNumber = collectorModel.phoneNumber;
    response.telephoneNumber = collectorModel.telephoneNumber;
    response.commissionPercent = collectorModel.commissionPercent;
    response.bank = collectorModel.bank;
    response.reference = collectorModel.reference;
    response.notes = collectorModel.notes;
    response.createdAt = collectorModel.createdAt;
    response.isActive = collectorModel.isActive;
    return response;
  }
}
