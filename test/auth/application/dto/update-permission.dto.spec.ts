import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePermissionDto } from '@/auth/application/dto/update-permission.dto';

describe('UpdatePermissionDto', () => {
  it('valida con una descripción válida', async () => {
    const dto = plainToInstance(UpdatePermissionDto, {
      description: 'Nueva descripción',
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rechaza si description está vacío', async () => {
    const dto = plainToInstance(UpdatePermissionDto, { description: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });

  it('rechaza si description supera 255 caracteres', async () => {
    const dto = plainToInstance(UpdatePermissionDto, {
      description: 'x'.repeat(256),
    });
    const errors = await validate(dto);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('rechaza si description está ausente', async () => {
    const dto = plainToInstance(UpdatePermissionDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });
});
