import { Logger } from '@nestjs/common';
import { DesactivateAssignationHandler } from './deactivate-assignation.handler';
import { DeactivateAssignationsCommand } from '@/community/application/command/deactivate-assignations.command';
import { Result, ErrorType } from '@/shared/domain/dto/result.dto';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

beforeAll(() => jest.spyOn(Logger.prototype, 'log').mockImplementation());

const AID1 = '01907c2a-0000-7000-8000-000000000001';
const AID2 = '01907c2a-0000-7000-8000-000000000002';

describe('DesactivateAssignationHandler', () => {
  let handler: DesactivateAssignationHandler;
  let assignationService: { deactivate: jest.Mock };
  let uow: { runInTransaction: jest.Mock };

  const command = new DeactivateAssignationsCommand([
    { assignationId: AID1, reason: 'Traslado' },
    { assignationId: AID2, reason: 'Traslado' },
  ]);

  beforeEach(() => {
    assignationService = { deactivate: jest.fn() };
    uow = {
      runInTransaction: jest.fn().mockImplementation((fn: () => Promise<any>) => fn()),
    };
    handler = new DesactivateAssignationHandler(
      assignationService as any,
      uow as any,
    );
  });

  it('debería devolver ok cuando el servicio tiene éxito', async () => {
    assignationService.deactivate.mockResolvedValue(Result.ok());

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(assignationService.deactivate).toHaveBeenCalledWith(
      command.deactivateAssignations,
    );
  });

  it('debería lanzar DomainException cuando el servicio falla', async () => {
    assignationService.deactivate.mockResolvedValue(
      Result.fail({
        message: 'Assignations not found',
        entity: 'Assignation',
        type: ErrorType.NOT_FOUND,
      }),
    );

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('debería ejecutar dentro de una transacción', async () => {
    assignationService.deactivate.mockResolvedValue(Result.ok());

    await handler.execute(command);

    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
  });
});
