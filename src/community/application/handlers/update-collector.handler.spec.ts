import { UpdateCollectorHandler } from './update-collector.handler';
import {
  UpdateCollectorPersonalCommand,
  UpdateCollectorAddressCommand,
  UpdateCollectorContactCommand,
} from '@/community/application/command/update-collector.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { Address, Numeration } from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';

function makeCollector(): Collector {
  return Collector.recreate(COLLECTOR_ID, {
    userId: UserId.of(USER_ID),
    firstname: 'Juan',
    firstLastname: 'García',
    secondLastname: null,
    nss: NSS.of('12345678901'),
    nssHash: 'hash',
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'hash-old',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'hash',
    paymentData: PaymentData.of({ commissionPercent: 10, bank: 'BBVA', reference: 'REF', nomina: 1000, transportAllowance: 200 }),
    assignations: new Set(),
    createdAt: new Date(),
    isActive: true,
    profilePath: 'profile.png',
    collectorNumber: 1,
  });
}

function makeRepo(collector: Collector | null) {
  return {
    findById: jest.fn().mockResolvedValue(collector),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

function makeHasher() {
  return { hash: jest.fn().mockResolvedValue('hashed-value') };
}

describe('UpdateCollectorHandler', () => {
  it('debería fallar con NOT_FOUND si el colector no existe', async () => {
    const handler = new UpdateCollectorHandler(makeRepo(null) as any, makeHasher() as any);
    const cmd = new UpdateCollectorPersonalCommand(COLLECTOR_ID, 'Pedro');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería actualizar datos personales y guardar', async () => {
    const collector = makeCollector();
    const repo = makeRepo(collector);
    const handler = new UpdateCollectorHandler(repo as any, makeHasher() as any);
    const cmd = new UpdateCollectorPersonalCommand(COLLECTOR_ID, 'Pedro', 'Martínez');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(collector.firstname).toBe('Pedro');
    expect(repo.save).toHaveBeenCalledWith(collector);
  });

  it('debería calcular addressHash al actualizar dirección', async () => {
    const collector = makeCollector();
    const repo = makeRepo(collector);
    const hasher = makeHasher();
    const handler = new UpdateCollectorHandler(repo as any, hasher as any);
    const cmd = new UpdateCollectorAddressCommand(COLLECTOR_ID, 'Av. Reforma', '200');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(hasher.hash).toHaveBeenCalledTimes(1);
    expect(collector.addressHash).toBe('hashed-value');
  });

  it('debería calcular phoneNumberHash al actualizar contacto', async () => {
    const collector = makeCollector();
    const repo = makeRepo(collector);
    const hasher = makeHasher();
    const handler = new UpdateCollectorHandler(repo as any, hasher as any);
    const cmd = new UpdateCollectorContactCommand(COLLECTOR_ID, '5598765432');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(hasher.hash).toHaveBeenCalledWith('5598765432', true);
  });
});
