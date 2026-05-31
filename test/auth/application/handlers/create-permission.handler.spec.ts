import { CreatePermissionHandler } from '@/auth/application/handlers/create-permission.handler';
import { CreatePermissionCommand } from '@/auth/application/commands/create-permission.command';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { ErrorType } from '@/shared/domain/dto/result.dto';

function makePermission(name: string): Permission {
  return Permission.create({ name, description: 'desc' });
}

function makeRepo(
  overrides: Partial<jest.Mocked<IPermissionRepository>> = {},
): jest.Mocked<IPermissionRepository> {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByRoleId: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any;
}

describe('CreatePermissionHandler', () => {
  it('crea el permiso y devuelve su id cuando no existe conflicto', async () => {
    const repo = makeRepo();
    const handler = new CreatePermissionHandler(repo);

    const result = await handler.execute(
      new CreatePermissionCommand('view:church', 'Ver iglesia'),
    );

    expect(result.isSuccess).toBe(true);
    expect(typeof result.value).toBe('string');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('devuelve CONFLICT si ya existe un permiso con ese nombre', async () => {
    const repo = makeRepo({
      findAll: jest.fn().mockResolvedValue([makePermission('view:church')]),
    });
    const handler = new CreatePermissionHandler(repo);

    const result = await handler.execute(
      new CreatePermissionCommand('view:church', 'Ver iglesia'),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
    expect(repo.save).not.toHaveBeenCalled();
  });
});
