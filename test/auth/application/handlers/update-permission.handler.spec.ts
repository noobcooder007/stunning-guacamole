import { UpdatePermissionHandler } from '@/auth/application/handlers/update-permission.handler';
import { UpdatePermissionCommand } from '@/auth/application/commands/update-permission.command';
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

describe('UpdatePermissionHandler', () => {
  it('actualiza la descripción y persiste el cambio', async () => {
    const permission = Permission.recreate(VALID_UUID, {
      name: 'view:church',
      description: 'Descripción vieja',
      isActive: true,
      createdAt: new Date(),
    });
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(permission) });
    const handler = new UpdatePermissionHandler(repo);

    const result = await handler.execute(
      new UpdatePermissionCommand(VALID_UUID, 'Descripción nueva'),
    );

    expect(result.isSuccess).toBe(true);
    expect(permission.description).toBe('Descripción nueva');
    expect(repo.save).toHaveBeenCalledWith(permission);
  });

  it('devuelve NOT_FOUND si el permiso no existe', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const handler = new UpdatePermissionHandler(repo);

    const result = await handler.execute(
      new UpdatePermissionCommand(VALID_UUID, 'Descripción nueva'),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(repo.save).not.toHaveBeenCalled();
  });
});
