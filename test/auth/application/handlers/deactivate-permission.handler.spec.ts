import { DeactivatePermissionHandler } from '@/auth/application/handlers/deactivate-permission.handler';
import { DeactivatePermissionCommand } from '@/auth/application/commands/deactivate-permission.command';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const VALID_UUID = '00000000-0000-0000-0000-000000000001';

function makeRepo(
  overrides: Partial<jest.Mocked<IPermissionRepository>> = {},
): jest.Mocked<IPermissionRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByIds: jest.fn(),
    findByRoleId: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any;
}

describe('DeactivatePermissionHandler', () => {
  it('desactiva el permiso y persiste el cambio', async () => {
    const permission = Permission.recreate(VALID_UUID, {
      name: 'view:church',
      description: 'Ver iglesia',
      isActive: true,
      createdAt: new Date(),
    });
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(permission) });
    const handler = new DeactivatePermissionHandler(repo);

    const result = await handler.execute(
      new DeactivatePermissionCommand(VALID_UUID),
    );

    expect(result.isSuccess).toBe(true);
    expect(permission.isActive).toBe(false);
    expect(repo.save).toHaveBeenCalledWith(permission);
  });

  it('devuelve NOT_FOUND si el permiso no existe', async () => {
    const repo = makeRepo();
    const handler = new DeactivatePermissionHandler(repo);

    const result = await handler.execute(
      new DeactivatePermissionCommand(VALID_UUID),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(repo.save).not.toHaveBeenCalled();
  });
});
