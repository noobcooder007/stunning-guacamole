import { GetRoleByIdHandler } from '@/auth/application/handlers/get-role-by-id.handler';
import { GetRoleByIdQuery } from '@/auth/application/queries/get-role-by-id.query';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { Role } from '@/auth/domain/aggregates/role.aggregate';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const ROLE_UUID = '00000000-0000-0000-0000-000000000001';

function makeRole(): Role {
  return Role.recreate(ROLE_UUID, {
    name: 'administrator',
    description: 'Administrador',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    permissions: new Set([
      Permission.create({ name: 'view:church', description: 'desc' }),
      Permission.create({ name: 'add:church', description: 'desc' }),
    ]),
  });
}

function makeRepo(
  overrides: Partial<jest.Mocked<IRoleRepository>> = {},
): jest.Mocked<IRoleRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByName: jest.fn(),
    save: jest.fn(),
    ...overrides,
  } as any;
}

describe('GetRoleByIdHandler', () => {
  it('devuelve el rol con sus permisos cuando existe', async () => {
    const role = makeRole();
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(role) });
    const handler = new GetRoleByIdHandler(null as any, repo);

    const result = await handler.execute(new GetRoleByIdQuery(ROLE_UUID));

    expect(result.isSuccess).toBe(true);
    expect(result.value!.id).toBe(ROLE_UUID);
    expect(result.value!.name).toBe('administrator');
    expect(result.value!.permissions).toHaveLength(2);
  });

  it('devuelve NOT_FOUND si el rol no existe', async () => {
    const handler = new GetRoleByIdHandler(null as any, makeRepo());

    const result = await handler.execute(new GetRoleByIdQuery(ROLE_UUID));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('los permisos del resultado incluyen id, name, description, isActive', async () => {
    const role = makeRole();
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(role) });
    const handler = new GetRoleByIdHandler(null as any, repo);

    const result = await handler.execute(new GetRoleByIdQuery(ROLE_UUID));
    const perm = result.value!.permissions[0];

    expect(perm).toHaveProperty('id');
    expect(perm).toHaveProperty('name');
    expect(perm).toHaveProperty('description');
    expect(perm).toHaveProperty('isActive');
  });
});
