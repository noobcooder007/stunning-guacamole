import { DeactivateCollectorHanlder } from './deactivate-collector.handler';
import { DeactivateCollectorCommand } from '@/community/application/command/deactivate-collector.command';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';

function makeCollector(): Collector {
  return Collector.recreate(COLLECTOR_ID, {
    userId: UserId.of(USER_ID),
    firstname: 'Juan',
    firstLastname: 'Pérez',
    nss: NSS.of('12345678901'),
    nssHash: 'h',
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'h',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'h',
    paymentData: PaymentData.of({
      commissionPercent: 10,
      bank: 'BBVA',
      reference: 'R',
      nomina: 0,
      transportAllowance: 0,
    }),
    profilePath: '/p.jpg',
    assignations: new Set(),
    isActive: true,
  });
}

describe('DeactivateCollectorHandler', () => {
  let handler: DeactivateCollectorHanlder;
  let collectorRepository: {
    findById: jest.Mock;
    exists: jest.Mock;
    save: jest.Mock;
  };
  let publisher: { mergeObjectContext: jest.Mock };
  let uow: { runInTransaction: jest.Mock };

  const command = new DeactivateCollectorCommand(COLLECTOR_ID);

  beforeEach(() => {
    collectorRepository = {
      findById: jest.fn(),
      exists: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    publisher = {
      mergeObjectContext: jest.fn().mockImplementation((c) => {
        c.commit = jest.fn();
        return c;
      }),
    };
    uow = {
      runInTransaction: jest
        .fn()
        .mockImplementation((fn: () => Promise<any>) => fn()),
    };
    handler = new DeactivateCollectorHanlder(
      collectorRepository as any,
      publisher as any,
      uow as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando el colector no existe en absoluto', async () => {
    collectorRepository.findById.mockResolvedValue(null);
    collectorRepository.exists.mockResolvedValue(false);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería retornar ok (idempotente) cuando ya está desactivado', async () => {
    collectorRepository.findById.mockResolvedValue(null);
    collectorRepository.exists.mockResolvedValue(true);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(collectorRepository.save).not.toHaveBeenCalled();
  });

  it('debería desactivar, guardar y hacer commit en el caso exitoso', async () => {
    const collector = makeCollector();
    collectorRepository.findById.mockResolvedValue(collector);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(collector.isActive).toBe(false);
    expect(collectorRepository.save).toHaveBeenCalledTimes(1);
    expect(collector.commit).toHaveBeenCalledTimes(1);
  });
});
