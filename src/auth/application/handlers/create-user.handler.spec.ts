import { Logger } from '@nestjs/common';
import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';

beforeAll(() => jest.spyOn(Logger.prototype, 'log').mockImplementation());

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let createUserService: { execute: jest.Mock };

  beforeEach(() => {
    createUserService = { execute: jest.fn() };
    handler = new CreateUserHandler(createUserService as any);
  });

  it('debería delegar la creación del usuario a CreateUserService', async () => {
    const command = new CreateUserCommand(
      'testuser',
      'password123',
      'collector',
    );
    createUserService.execute.mockResolvedValue(
      Result.ok('01907c2a-0000-7000-8000-000000000001'),
    );

    const result = await handler.execute(command);

    expect(createUserService.execute).toHaveBeenCalledWith(command);
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe('01907c2a-0000-7000-8000-000000000001');
  });

  it('debería propagar el fallo cuando CreateUserService retorna error', async () => {
    const command = new CreateUserCommand(
      'testuser',
      'password123',
      'inexistente',
    );
    createUserService.execute.mockResolvedValue(
      Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'Role not found, select another one',
        entity: 'Role',
      }),
    );

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });
});
