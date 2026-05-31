import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AssignPermissionsDto } from '@/auth/application/dto/assign-permissions.dto';

const UUID_1 = '00000000-0000-4000-8000-000000000001';
const UUID_2 = '00000000-0000-4000-8000-000000000002';

describe('AssignPermissionsDto', () => {
  it('valida con un array de UUIDs válidos', async () => {
    const dto = plainToInstance(AssignPermissionsDto, {
      permissionIds: [UUID_1, UUID_2],
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('valida con un solo UUID', async () => {
    const dto = plainToInstance(AssignPermissionsDto, {
      permissionIds: [UUID_1],
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rechaza si el array está vacío', async () => {
    const dto = plainToInstance(AssignPermissionsDto, { permissionIds: [] });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'permissionIds')).toBe(true);
  });

  it('rechaza si algún elemento no es UUID', async () => {
    const dto = plainToInstance(AssignPermissionsDto, {
      permissionIds: [UUID_1, 'no-es-uuid'],
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'permissionIds')).toBe(true);
  });

  it('rechaza si permissionIds está ausente', async () => {
    const dto = plainToInstance(AssignPermissionsDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'permissionIds')).toBe(true);
  });

  it('rechaza si permissionIds no es un array', async () => {
    const dto = plainToInstance(AssignPermissionsDto, {
      permissionIds: UUID_1,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'permissionIds')).toBe(true);
  });
});
