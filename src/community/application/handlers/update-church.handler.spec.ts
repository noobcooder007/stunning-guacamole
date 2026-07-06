import { UpdateChurchHandler } from './update-church.handler';
import { UpdateChurchPriestCommand } from '@/community/application/command/update-church.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { Church } from '@/community/domain/aggregate/church.aggregate';
import { EcclesialIdentity } from '@/community/domain/value-objects/ecclesial-identity.vo';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { Priest } from '@/community/domain/value-objects/priest.vo';

const CHURCH_ID = '01907c2a-0000-7000-8000-000000000001';

function makeChurch(): Church {
  return Church.recreate(CHURCH_ID, {
    ecclesialIdentity: EcclesialIdentity.of({
      name: 'San Pedro',
      vicaria: 'Norte',
      decanato: 'D1',
      parroquia: 'San Pedro',
      capilla: 'Central',
    }),
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    phoneNumber: PhoneNumber.of('5512345678'),
    priest: Priest.of({
      firstname: 'Pedro',
      firstLastname: 'García',
      secondLastname: null,
    }),
    auxiliarPriest: null,
    isActive: true,
    createdAt: new Date(),
  });
}

describe('UpdateChurchHandler', () => {
  it('debería fallar con NOT_FOUND si la iglesia no existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const handler = new UpdateChurchHandler(repo as any);
    const cmd = new UpdateChurchPriestCommand(
      CHURCH_ID,
      'Carlos',
      'Ramírez',
      null,
    );

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería actualizar y guardar la iglesia', async () => {
    const church = makeChurch();
    const repo = {
      findById: jest.fn().mockResolvedValue(church),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const handler = new UpdateChurchHandler(repo as any);
    const cmd = new UpdateChurchPriestCommand(
      CHURCH_ID,
      'Carlos',
      'Ramírez',
      null,
    );

    const result = await handler.execute(cmd);

    expect(result.isSuccess).toBe(true);
    expect(church.priest.firstname).toBe('Carlos');
    expect(repo.save).toHaveBeenCalledWith(church);
  });
});
