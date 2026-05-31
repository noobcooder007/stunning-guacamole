import { GetAllPermissionsHandler } from '@/auth/application/handlers/get-all-permissions.handler';
import { GetAllPermissionsQuery } from '@/auth/application/queries/get-all-permissions.query';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { Permission } from '@/auth/domain/entities/permission.entity';

function makeRepo(
  permissions: Permission[],
): jest.Mocked<IPermissionRepository> {
  return {
    findAll: jest.fn().mockResolvedValue(permissions),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByRoleId: jest.fn(),
    save: jest.fn(),
  } as any;
}

describe('GetAllPermissionsHandler', () => {
  it('devuelve la lista de permisos mapeada a PermissionResponse', async () => {
    const perms = [
      Permission.create({ name: 'view:church', description: 'Ver iglesia' }),
      Permission.create({ name: 'add:church', description: 'Añadir iglesia' }),
    ];
    const handler = new GetAllPermissionsHandler(null as any, makeRepo(perms));

    const result = await handler.execute(new GetAllPermissionsQuery());

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value![0].name).toBe('view:church');
    expect(result.value![1].name).toBe('add:church');
  });

  it('devuelve array vacío cuando no hay permisos', async () => {
    const handler = new GetAllPermissionsHandler(null as any, makeRepo([]));

    const result = await handler.execute(new GetAllPermissionsQuery());

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });

  it('cada elemento expone id, name, description, isActive y createdAt', async () => {
    const perm = Permission.create({
      name: 'edit:role',
      description: 'Editar rol',
    });
    const handler = new GetAllPermissionsHandler(null as any, makeRepo([perm]));

    const result = await handler.execute(new GetAllPermissionsQuery());
    const item = result.value![0];

    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('description');
    expect(item).toHaveProperty('isActive');
    expect(item).toHaveProperty('createdAt');
  });
});
