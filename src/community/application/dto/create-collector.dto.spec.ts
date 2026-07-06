import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCollectorDto } from './create-collector.dto';

const validAddress = {
  street: 'Calle Principal',
  numeration: { noExt: '10' },
  neighborhood: 'Centro',
  city: 'Ciudad de México',
  state: 'CDMX',
  zipCode: '06600',
};

const validPayload = {
  username: 'collector01',
  password: 'secret123',
  firstname: 'Juan',
  firstLastname: 'Pérez',
  nss: '12345678901',
  address: validAddress,
  phoneNumber: '+525512345678',
  commissionPercent: 10,
  nomina: 500,
  transportAllowance: 100,
  bank: 'BBVA',
  reference: 'REF001',
};

describe('CreateCollectorDto', () => {
  it('debería validar con datos completos y correctos', async () => {
    const dto = plainToInstance(CreateCollectorDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería aceptar campos opcionales ausentes (secondLastname, telephoneNumber, notes)', async () => {
    const dto = plainToInstance(CreateCollectorDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.secondLastname).toBeUndefined();
    expect(dto.telephoneNumber).toBeUndefined();
    expect(dto.notes).toBeUndefined();
  });

  describe('username', () => {
    it('debería rechazar username con menos de 4 caracteres', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        username: 'ab',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'username')).toBeDefined();
    });

    it('debería rechazar username con más de 50 caracteres', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        username: 'a'.repeat(51),
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'username')).toBeDefined();
    });
  });

  describe('password', () => {
    it('debería rechazar password con menos de 8 caracteres', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        password: 'short',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'password')).toBeDefined();
    });

    it('debería rechazar password con más de 50 caracteres', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        password: 'p'.repeat(51),
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'password')).toBeDefined();
    });
  });

  describe('firstname / firstLastname', () => {
    it('debería rechazar firstname vacío', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        firstname: '',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'firstname')).toBeDefined();
    });

    it('debería rechazar firstLastname vacío', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        firstLastname: '',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'firstLastname')).toBeDefined();
    });
  });

  describe('nss', () => {
    it('debería rechazar NSS con menos de 11 dígitos', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        nss: '123456789',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'nss')).toBeDefined();
    });

    it('debería rechazar NSS con más de 11 caracteres', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        nss: '123456789012',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'nss')).toBeDefined();
    });

    it('debería rechazar NSS con caracteres no numéricos', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        nss: '1234567890A',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'nss')).toBeDefined();
    });
  });

  describe('phoneNumber', () => {
    it('debería rechazar phoneNumber inválido para México', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        phoneNumber: '12345',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'phoneNumber')).toBeDefined();
    });
  });

  describe('datos de pago', () => {
    it('debería rechazar bank vacío', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        bank: '',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'bank')).toBeDefined();
    });

    it('debería rechazar reference vacío', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        reference: '',
      });
      const errors = await validate(dto);
      expect(errors.find((e) => e.property === 'reference')).toBeDefined();
    });

    it('debería rechazar commissionPercent no numérico', async () => {
      const dto = plainToInstance(CreateCollectorDto, {
        ...validPayload,
        commissionPercent: 'diez' as any,
      });
      const errors = await validate(dto);
      expect(
        errors.find((e) => e.property === 'commissionPercent'),
      ).toBeDefined();
    });
  });
});
