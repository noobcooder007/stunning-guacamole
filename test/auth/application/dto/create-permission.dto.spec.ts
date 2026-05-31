import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePermissionDto } from '@/auth/application/dto/create-permission.dto';

describe('CreatePermissionDto', () => {
  const valid = { name: 'view:church', description: 'Ver iglesia' };

  it('valida con datos correctos', async () => {
    const dto = plainToInstance(CreatePermissionDto, valid);
    expect(await validate(dto)).toHaveLength(0);
  });

  describe('name', () => {
    it.each([
      'view:church',
      'add:promise-donation',
      'edit:role',
      'delete:beneficient',
    ])('acepta "%s"', async (name) => {
      const dto = plainToInstance(CreatePermissionDto, { ...valid, name });
      expect(await validate(dto)).toHaveLength(0);
    });

    it.each([
      'VIEW:CHURCH',
      'sin-dos-puntos',
      'view church',
      ':church',
      'view:',
      '',
    ])('rechaza "%s"', async (name) => {
      const dto = plainToInstance(CreatePermissionDto, { ...valid, name });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('rechaza si supera 100 caracteres', async () => {
      const dto = plainToInstance(CreatePermissionDto, {
        ...valid,
        name: 'view:' + 'x'.repeat(96),
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('rechaza si está ausente', async () => {
      const dto = plainToInstance(CreatePermissionDto, {
        description: 'desc',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
  });

  describe('description', () => {
    it('rechaza si está vacío', async () => {
      const dto = plainToInstance(CreatePermissionDto, {
        ...valid,
        description: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });

    it('rechaza si supera 255 caracteres', async () => {
      const dto = plainToInstance(CreatePermissionDto, {
        ...valid,
        description: 'x'.repeat(256),
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });

    it('rechaza si está ausente', async () => {
      const dto = plainToInstance(CreatePermissionDto, { name: 'view:church' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });
  });
});
