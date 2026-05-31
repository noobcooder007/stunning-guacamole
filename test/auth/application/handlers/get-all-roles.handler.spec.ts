import { GetAllRolesHandler } from '@/auth/application/handlers/get-all-roles.handler';
import { GetAllRolesQuery } from '@/auth/application/queries/get-all-roles.query';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { Role } from '@/auth/domain/aggregates/role.aggregate';
import { Permission } from '@/auth/domain/entities/permission.entity';

function makeRole(name: string): Role {
  return Role.create({
    name,
    description: `Rol ${name}`,
    permissions: new Set([
      Permission.create({ name: 'view:church', description: 'desc' }),
    ]),
  });
}

function makeRepo(roles: Role[]): jest.Mocked<IRoleRepository> {
  return {
    findAll: jest.fn().mockResolvedValue(roles),
    findById: jest.fn(),
    findByName: jest.fn(),
    save: jest.fn(),
  } as any;
}

describe('GetAllRolesHandler', () => {
  it('devuelve la lista de roles con sus permisos', async () => {
    const roles = [makeRole('administrator'), makeRole('collector')];
    const handler = new GetAllRolesHandler(null as any, makeRepo(roles));

    const result = await handler.execute(new GetAllRolesQuery());

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value![0].name).toBe('administrator');
    expect(result.value![0].permissions).toHaveLength(1);
  });

  it('devuelve array vacío cuando no hay roles', async () => {
    const handler = new GetAllRolesHandler(null as any, makeRepo([]));

    const result = await handler.execute(new GetAllRolesQuery());

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });

  it('cada rol expone id, name, description, isActive, createdAt y permissions', async () => {
    const handler = new GetAllRolesHandler(
      null as any,
      makeRepo([makeRole('beneficient')]),
    );

    const result = await handler.execute(new GetAllRolesQuery());
    const item = result.value![0];

    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('description');
    expect(item).toHaveProperty('isActive');
    expect(item).toHaveProperty('createdAt');
    expect(item).toHaveProperty('permissions');
    expect(Array.isArray(item.permissions)).toBe(true);
  });
});
