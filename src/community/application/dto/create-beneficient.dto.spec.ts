import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBeneficientDto } from './create-beneficient.dto';

const CHURCH_ID = '01907c2a-0000-7000-8000-000000000001';

const validAddress = {
  street: 'Calle 1',
  numeration: { noExt: '10' },
  neighborhood: 'Centro',
  city: 'CDMX',
  state: 'CDMX',
  zipCode: '06600',
};

const validPayload = {
  title: 'Sr.',
  firstname: 'Juan',
  firstLastname: 'Pérez',
  birthday: '1985-03-15T00:00:00.000Z',
  genre: 'M',
  maritalStatus: 'Soltero',
  keepPrivate: false,
  address: validAddress,
  churchId: CHURCH_ID,
};

describe('CreateBeneficientDto', () => {
  it('debería validar con datos mínimos correctos', async () => {
    const dto = plainToInstance(CreateBeneficientDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar firstname vacío', async () => {
    const dto = plainToInstance(CreateBeneficientDto, {
      ...validPayload,
      firstname: '',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'firstname')).toBeDefined();
  });

  it('debería rechazar genre inválido', async () => {
    const dto = plainToInstance(CreateBeneficientDto, {
      ...validPayload,
      genre: 'X',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'genre')).toBeDefined();
  });

  it('debería aceptar F como género femenino', async () => {
    const dto = plainToInstance(CreateBeneficientDto, {
      ...validPayload,
      genre: 'F',
    });
    expect((await validate(dto)).length).toBe(0);
  });

  it('debería rechazar maritalStatus inválido', async () => {
    const dto = plainToInstance(CreateBeneficientDto, {
      ...validPayload,
      maritalStatus: 'Separado',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'maritalStatus')).toBeDefined();
  });

  it('debería aceptar los cuatro estados civiles válidos', async () => {
    for (const status of ['Soltero', 'Casado', 'Divorciado', 'Viudo']) {
      const dto = plainToInstance(CreateBeneficientDto, {
        ...validPayload,
        maritalStatus: status,
      });
      expect(
        (await validate(dto)).find((e) => e.property === 'maritalStatus'),
      ).toBeUndefined();
    }
  });

  it('debería rechazar churchId que no sea UUID', async () => {
    const dto = plainToInstance(CreateBeneficientDto, {
      ...validPayload,
      churchId: 'no-uuid',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'churchId')).toBeDefined();
  });

  it('debería rechazar email inválido cuando se provee', async () => {
    const dto = plainToInstance(CreateBeneficientDto, {
      ...validPayload,
      email: 'no-es-email',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'email')).toBeDefined();
  });

  it('debería rechazar person inválido (no FISICA/MORAL)', async () => {
    const dto = plainToInstance(CreateBeneficientDto, {
      ...validPayload,
      person: 'OTRO',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'person')).toBeDefined();
  });

  it('debería aceptar campos opcionales ausentes', async () => {
    const dto = plainToInstance(CreateBeneficientDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.email).toBeUndefined();
    expect(dto.secondLastname).toBeUndefined();
  });
});
