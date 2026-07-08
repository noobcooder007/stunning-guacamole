import { ReactivateCollectorHandler } from './reactivate-collector.handler';
import { ReactivateCollectorCommand } from '@/community/application/command/reactivate-collector.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';
const PROFILE_ID = '01907c2a-0000-7000-8000-000000000003';

function makeProfile(): Profile {
  return Profile.recreate(PROFILE_ID, {
    firstname: 'Juan',
    firstLastname: 'García',
    secondLastname: null,
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'hash',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'hash',
  });
}

function makeCollector(): Collector {
  return Collector.recreate(COLLECTOR_ID, {
    userId: UserId.of(USER_ID),
    profileId: makeProfile()._id,
    profile: makeProfile(),
    nss: NSS.of('12345678901'),
    nssHash: 'hash',
    paymentData: PaymentData.of({
      commissionPercent: 10,
      bank: 'BBVA',
      reference: 'REF',
      nomina: 1000,
      transportAllowance: 200,
    }),
    assignations: new Set(),
    createdAt: new Date(),
    isActive: false,
    profilePath: 'profile.png',
    collectorNumber: 1,
  });
}

describe('ReactivateCollectorHandler', () => {
  it('debería fallar con NOT_FOUND si el colector no existe o ya está activo', async () => {
    const repo = {
      findInactiveById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const handler = new ReactivateCollectorHandler(repo as any);

    const result = await handler.execute(
      new ReactivateCollectorCommand(COLLECTOR_ID),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería reactivar y guardar el colector', async () => {
    const collector = makeCollector();
    const repo = {
      findInactiveById: jest.fn().mockResolvedValue(collector),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const handler = new ReactivateCollectorHandler(repo as any);

    const result = await handler.execute(
      new ReactivateCollectorCommand(COLLECTOR_ID),
    );

    expect(result.isSuccess).toBe(true);
    expect(collector.isActive).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(collector);
  });
});
