import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DeactivateAssignationsDto } from './deactivate-assignations.dto';

const AID = '01907c2a-0000-7000-8000-000000000001';

describe('DeactivateAssignationsDto', () => {
  it('debería validar con una asignación válida', async () => {
    const dto = plainToInstance(DeactivateAssignationsDto, {
      deactivateAssignations: [{ assignationId: AID, reason: 'Traslado' }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería validar con múltiples asignaciones', async () => {
    const AID2 = '01907c2a-0000-7000-8000-000000000002';
    const dto = plainToInstance(DeactivateAssignationsDto, {
      deactivateAssignations: [
        { assignationId: AID, reason: 'Traslado' },
        { assignationId: AID2, reason: 'Baja' },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar assignationId que no sea UUID', async () => {
    const dto = plainToInstance(DeactivateAssignationsDto, {
      deactivateAssignations: [
        { assignationId: 'no-uuid', reason: 'Traslado' },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('debería rechazar cuando reason está vacío', async () => {
    const dto = plainToInstance(DeactivateAssignationsDto, {
      deactivateAssignations: [{ assignationId: AID, reason: '' }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
