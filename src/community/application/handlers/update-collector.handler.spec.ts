import { UpdateCollectorHandler } from './update-collector.handler';
import {
  UpdateCollectorPersonalCommand,
  UpdateCollectorAddressCommand,
  UpdateCollectorContactCommand,
  UpdateCollectorPaymentCommand,
} from '@/community/application/command/update-collector.command';
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
    addressHash: 'hash-old',
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
    isActive: true,
    profilePath: 'profile.png',
    collectorNumber: 1,
  });
}

function makeUow() {
  return {
    runInTransaction: jest
      .fn()
      .mockImplementation((fn: () => Promise<any>) => fn()),
  };
}

function makeCollectorRepo(collector: Collector | null) {
  return {
    findById: jest.fn().mockResolvedValue(collector),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

function makeProfileRepo() {
  return { save: jest.fn().mockResolvedValue(undefined) };
}

function makeHasher() {
  return { hash: jest.fn().mockResolvedValue('hashed-value') };
}

describe('UpdateCollectorHandler', () => {
  it('debería fallar con NOT_FOUND si el colector no existe', async () => {
    const handler = new UpdateCollectorHandler(
      makeUow() as any,
      makeCollectorRepo(null) as any,
      makeProfileRepo() as any,
      makeHasher() as any,
    );
    const cmd = new UpdateCollectorPersonalCommand(COLLECTOR_ID, 'Pedro');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería actualizar datos personales solo en el perfil', async () => {
    const collector = makeCollector();
    const collectorRepo = makeCollectorRepo(collector);
    const profileRepo = makeProfileRepo();
    const handler = new UpdateCollectorHandler(
      makeUow() as any,
      collectorRepo as any,
      profileRepo as any,
      makeHasher() as any,
    );
    const cmd = new UpdateCollectorPersonalCommand(
      COLLECTOR_ID,
      'Pedro',
      'Martínez',
    );

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(collector.profile.firstname).toBe('Pedro');
    expect(profileRepo.save).toHaveBeenCalledWith(collector.profile);
    expect(collectorRepo.save).not.toHaveBeenCalled();
  });

  it('debería calcular addressHash y actualizar solo el perfil', async () => {
    const collector = makeCollector();
    const collectorRepo = makeCollectorRepo(collector);
    const profileRepo = makeProfileRepo();
    const hasher = makeHasher();
    const handler = new UpdateCollectorHandler(
      makeUow() as any,
      collectorRepo as any,
      profileRepo as any,
      hasher as any,
    );
    const cmd = new UpdateCollectorAddressCommand(
      COLLECTOR_ID,
      'Av. Reforma',
      '200',
    );

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(hasher.hash).toHaveBeenCalledTimes(1);
    expect(collector.profile.addressHash).toBe('hashed-value');
    expect(profileRepo.save).toHaveBeenCalledWith(collector.profile);
    expect(collectorRepo.save).not.toHaveBeenCalled();
  });

  it('debería actualizar el perfil cuando cambia el teléfono personal', async () => {
    const collector = makeCollector();
    const collectorRepo = makeCollectorRepo(collector);
    const profileRepo = makeProfileRepo();
    const hasher = makeHasher();
    const handler = new UpdateCollectorHandler(
      makeUow() as any,
      collectorRepo as any,
      profileRepo as any,
      hasher as any,
    );
    const cmd = new UpdateCollectorContactCommand(COLLECTOR_ID, '5598765432');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(hasher.hash).toHaveBeenCalledWith('5598765432', true);
    expect(profileRepo.save).toHaveBeenCalledWith(collector.profile);
    expect(collectorRepo.save).not.toHaveBeenCalled();
  });

  it('debería actualizar el colector cuando cambia el teléfono fijo', async () => {
    const collector = makeCollector();
    const collectorRepo = makeCollectorRepo(collector);
    const profileRepo = makeProfileRepo();
    const hasher = makeHasher();
    const handler = new UpdateCollectorHandler(
      makeUow() as any,
      collectorRepo as any,
      profileRepo as any,
      hasher as any,
    );
    const cmd = new UpdateCollectorContactCommand(
      COLLECTOR_ID,
      undefined,
      '5511112222',
    );

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(collectorRepo.save).toHaveBeenCalledWith(collector);
    expect(profileRepo.save).not.toHaveBeenCalled();
  });

  it('debería actualizar solo el colector para comandos de pago', async () => {
    const collector = makeCollector();
    const collectorRepo = makeCollectorRepo(collector);
    const profileRepo = makeProfileRepo();
    const handler = new UpdateCollectorHandler(
      makeUow() as any,
      collectorRepo as any,
      profileRepo as any,
      makeHasher() as any,
    );
    const cmd = new UpdateCollectorPaymentCommand(COLLECTOR_ID, 15);

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(collector.paymentData.commissionPercent).toBe(15);
    expect(collectorRepo.save).toHaveBeenCalledWith(collector);
    expect(profileRepo.save).not.toHaveBeenCalled();
  });
});
