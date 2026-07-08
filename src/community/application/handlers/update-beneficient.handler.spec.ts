import { UpdateBeneficientHandler } from './update-beneficient.handler';
import {
  UpdateBeneficientPersonalCommand,
  UpdateBeneficientAddressCommand,
  UpdateBeneficientContactCommand,
  UpdateBeneficientChurchCommand,
  UpdateBeneficientPrivacyCommand,
} from '@/community/application/command/update-beneficient.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';

const BID = '01907c2a-0000-7000-8000-000000000001';
const CID = '01907c2a-0000-7000-8000-000000000002';
const PROFILE_ID = '01907c2a-0000-7000-8000-000000000003';

function makeProfile(): Profile {
  return Profile.recreate(PROFILE_ID, {
    firstname: 'Juan',
    firstLastname: 'Pérez',
    secondLastname: 'García',
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'addr-hash',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'phone-hash',
  });
}

function makeBeneficient(): Beneficient {
  return Beneficient.recreate(BID, {
    title: 'Sr.',
    profileId: makeProfile()._id,
    profile: makeProfile(),
    birthday: new Date('1985-03-15'),
    genre: 'MALE',
    maritalStatus: 'SINGLE',
    church: ChurchId.of(CID),
    keepPrivate: false,
    isActive: true,
    reasonDeactivated: null,
    beneficientNumber: 99,
  });
}

function makeUow() {
  return {
    runInTransaction: jest
      .fn()
      .mockImplementation((fn: () => Promise<any>) => fn()),
  };
}

function makeBeneficientRepo(beneficient: Beneficient | null) {
  return {
    findById: jest.fn().mockResolvedValue(beneficient),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

function makeProfileRepo() {
  return { save: jest.fn().mockResolvedValue(undefined) };
}

function makeChurchRepo(found: any = { id: CID }) {
  return { findById: jest.fn().mockResolvedValue(found) };
}

function makeHasher() {
  return { hash: jest.fn().mockResolvedValue('hashed-value') };
}

describe('UpdateBeneficientHandler', () => {
  it('debería fallar con NOT_FOUND si el bienhechor no existe', async () => {
    const handler = new UpdateBeneficientHandler(
      makeUow() as any,
      makeBeneficientRepo(null) as any,
      makeChurchRepo() as any,
      makeProfileRepo() as any,
      makeHasher() as any,
    );
    const cmd = new UpdateBeneficientPersonalCommand(BID, 'Sra.');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería actualizar el nombre en el perfil y el resto en el bienhechor', async () => {
    const beneficient = makeBeneficient();
    const beneficientRepo = makeBeneficientRepo(beneficient);
    const profileRepo = makeProfileRepo();
    const handler = new UpdateBeneficientHandler(
      makeUow() as any,
      beneficientRepo as any,
      makeChurchRepo() as any,
      profileRepo as any,
      makeHasher() as any,
    );
    const cmd = new UpdateBeneficientPersonalCommand(
      BID,
      'Sra.',
      'María',
      'López',
    );

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(beneficient.profile.firstname).toBe('María');
    expect(beneficient.title).toBe('Sra.');
    expect(profileRepo.save).toHaveBeenCalledWith(beneficient.profile);
    expect(beneficientRepo.save).toHaveBeenCalledWith(beneficient);
  });

  it('debería calcular addressHash y actualizar solo el perfil', async () => {
    const beneficient = makeBeneficient();
    const beneficientRepo = makeBeneficientRepo(beneficient);
    const profileRepo = makeProfileRepo();
    const hasher = makeHasher();
    const handler = new UpdateBeneficientHandler(
      makeUow() as any,
      beneficientRepo as any,
      makeChurchRepo() as any,
      profileRepo as any,
      hasher as any,
    );
    const cmd = new UpdateBeneficientAddressCommand(BID, 'Av. Juárez', '100');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(hasher.hash).toHaveBeenCalledTimes(1);
    expect(beneficient.profile.addressHash).toBe('hashed-value');
    expect(profileRepo.save).toHaveBeenCalledWith(beneficient.profile);
    expect(beneficientRepo.save).not.toHaveBeenCalled();
  });

  it('debería actualizar el perfil cuando cambia el teléfono', async () => {
    const beneficient = makeBeneficient();
    const beneficientRepo = makeBeneficientRepo(beneficient);
    const profileRepo = makeProfileRepo();
    const handler = new UpdateBeneficientHandler(
      makeUow() as any,
      beneficientRepo as any,
      makeChurchRepo() as any,
      profileRepo as any,
      makeHasher() as any,
    );
    const cmd = new UpdateBeneficientContactCommand(
      BID,
      undefined,
      '5598765432',
    );

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(profileRepo.save).toHaveBeenCalledWith(beneficient.profile);
    expect(beneficientRepo.save).not.toHaveBeenCalled();
  });

  it('debería actualizar el bienhechor cuando cambia el email', async () => {
    const beneficient = makeBeneficient();
    const beneficientRepo = makeBeneficientRepo(beneficient);
    const profileRepo = makeProfileRepo();
    const handler = new UpdateBeneficientHandler(
      makeUow() as any,
      beneficientRepo as any,
      makeChurchRepo() as any,
      profileRepo as any,
      makeHasher() as any,
    );
    const cmd = new UpdateBeneficientContactCommand(BID, 'juan@example.com');

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(beneficient.email).toBe('juan@example.com');
    expect(beneficientRepo.save).toHaveBeenCalledWith(beneficient);
    expect(profileRepo.save).not.toHaveBeenCalled();
  });

  it('debería fallar con NOT_FOUND si la iglesia no existe', async () => {
    const beneficient = makeBeneficient();
    const handler = new UpdateBeneficientHandler(
      makeUow() as any,
      makeBeneficientRepo(beneficient) as any,
      makeChurchRepo(null) as any,
      makeProfileRepo() as any,
      makeHasher() as any,
    );
    const cmd = new UpdateBeneficientChurchCommand(BID, CID);

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería actualizar solo el bienhechor para comandos de privacidad', async () => {
    const beneficient = makeBeneficient();
    const beneficientRepo = makeBeneficientRepo(beneficient);
    const profileRepo = makeProfileRepo();
    const handler = new UpdateBeneficientHandler(
      makeUow() as any,
      beneficientRepo as any,
      makeChurchRepo() as any,
      profileRepo as any,
      makeHasher() as any,
    );
    const cmd = new UpdateBeneficientPrivacyCommand(BID, true);

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(beneficient.keepPrivate).toBe(true);
    expect(beneficientRepo.save).toHaveBeenCalledWith(beneficient);
    expect(profileRepo.save).not.toHaveBeenCalled();
  });
});
