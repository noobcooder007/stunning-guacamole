import { AssignPermissionsToRoleHandler } from '@/auth/application/handlers/assign-permissions-to-role.handler';
import { AssignPermissionsToRoleCommand } from '@/auth/application/commands/assign-permissions-to-role.command';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { Role } from '@/auth/domain/aggregates/role.aggregate';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const ROLE_UUID = '00000000-0000-0000-0000-000000000001';
const PERM_UUID_1 = '00000000-0000-0000-0000-000000000002';
const PERM_UUID_2 = '00000000-0000-0000-0000-000000000003';

function makeRole(): Role {
  return Role.recreate(ROLE_UUID, {
    name: 'collector',
    description: 'Colector',
    isActive: true,
    createdAt: new Date(),
    permissions: new Set([
      Permission.create({ name: 'view:church', description: 'desc' }),
    ]),
  });
}

function makePermission(id: string, name: string, isActive = true): Permission {
  return Permission.recreate(id, {
    name,
    description: 'desc',
    isActive,
    createdAt: new Date(),
  });
}

function makeRoleRepo(
  overrides: Partial<jest.Mocked<IRoleRepository>> = {},
): jest.Mocked<IRoleRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByName: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any;
}

function makePermRepo(
  overrides: Partial<jest.Mocked<IPermissionRepository>> = {},
): jest.Mocked<IPermissionRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn().mockResolvedValue([]),
    findByRoleId: jest.fn(),
    save: jest.fn(),
    ...overrides,
  } as any;
}

describe('AssignPermissionsToRoleHandler', () => {
  it('asigna los permisos al rol y persiste el cambio', async () => {
    const role = makeRole();
    const perms = [
      makePermission(PERM_UUID_1, 'add:church'),
      makePermission(PERM_UUID_2, 'edit:church'),
    ];
    const roleRepo = makeRoleRepo({
      findById: jest.fn().mockResolvedValue(role),
    });
    const permRepo = makePermRepo({
      findByIds: jest.fn().mockResolvedValue(perms),
    });
    const handler = new AssignPermissionsToRoleHandler(roleRepo, permRepo);

    const result = await handler.execute(
      new AssignPermissionsToRoleCommand(ROLE_UUID, [PERM_UUID_1, PERM_UUID_2]),
    );

    expect(result.isSuccess).toBe(true);
    expect(role.permissions).toHaveLength(2);
    expect(roleRepo.save).toHaveBeenCalledWith(role);
  });

  it('devuelve NOT_FOUND si el rol no existe', async () => {
    const roleRepo = makeRoleRepo();
    const permRepo = makePermRepo();
    const handler = new AssignPermissionsToRoleHandler(roleRepo, permRepo);

    const result = await handler.execute(
      new AssignPermissionsToRoleCommand(ROLE_UUID, [PERM_UUID_1]),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('devuelve NOT_FOUND si algún permiso no existe', async () => {
    const role = makeRole();
    const roleRepo = makeRoleRepo({
      findById: jest.fn().mockResolvedValue(role),
    });
    // Solo devuelve 1 de los 2 solicitados
    const permRepo = makePermRepo({
      findByIds: jest
        .fn()
        .mockResolvedValue([makePermission(PERM_UUID_1, 'add:church')]),
    });
    const handler = new AssignPermissionsToRoleHandler(roleRepo, permRepo);

    const result = await handler.execute(
      new AssignPermissionsToRoleCommand(ROLE_UUID, [PERM_UUID_1, PERM_UUID_2]),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(roleRepo.save).not.toHaveBeenCalled();
  });

  it('devuelve VALIDATION si algún permiso está inactivo', async () => {
    const role = makeRole();
    const perms = [
      makePermission(PERM_UUID_1, 'add:church', true),
      makePermission(PERM_UUID_2, 'edit:church', false), // inactivo
    ];
    const roleRepo = makeRoleRepo({
      findById: jest.fn().mockResolvedValue(role),
    });
    const permRepo = makePermRepo({
      findByIds: jest.fn().mockResolvedValue(perms),
    });
    const handler = new AssignPermissionsToRoleHandler(roleRepo, permRepo);

    const result = await handler.execute(
      new AssignPermissionsToRoleCommand(ROLE_UUID, [PERM_UUID_1, PERM_UUID_2]),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.VALIDATION);
    expect(roleRepo.save).not.toHaveBeenCalled();
  });
});
