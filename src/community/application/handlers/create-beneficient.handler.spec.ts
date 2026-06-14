import { CreateBeneficientHandler } from './create-beneficient.handler';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const CHURCH_ID = '01907c2a-0000-7000-8000-000000000001';

function makeCommand(withTax = false): CreateBeneficientCommand {
  return new CreateBeneficientCommand(
    'Sr.',
    'Juan',
    'Pérez',
    null,
    new Date('1985-01-01'),
    'MALE',
    'Soltero',
    'Calle 1',
    '10',
    null,
    'Centro',
    null,
    'CDMX',
    'CDMX',
    '06600',
    CHURCH_ID,
    false,
    undefined,
    withTax ? 'FÍSICA' : undefined,
    withTax ? 'Juan Pérez García' : undefined,
    withTax ? 'XAXX010101000' : undefined,
    'test@example.com',
    '5512345678',
  );
}

describe('CreateBeneficientHandler', () => {
  let handler: CreateBeneficientHandler;
  let beneficientRepository: { exists: jest.Mock; save: jest.Mock };
  let churchRepository: { findById: jest.Mock };
  let hasher: { hash: jest.Mock };

  beforeEach(() => {
    beneficientRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
    };
    churchRepository = { findById: jest.fn() };
    hasher = { hash: jest.fn().mockResolvedValue('hashed') };

    handler = new CreateBeneficientHandler(
      beneficientRepository as any,
      churchRepository as any,
      hasher as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando la iglesia no existe', async () => {
    churchRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(beneficientRepository.save).not.toHaveBeenCalled();
  });

  it('debería fallar con CONFLICT cuando el bienhechor ya existe', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });
    beneficientRepository.exists.mockResolvedValue(true);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
    expect(beneficientRepository.save).not.toHaveBeenCalled();
  });

  it('debería crear y guardar el bienhechor en el caso exitoso', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBeDefined();
    expect(beneficientRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería crear el bienhechor con información fiscal cuando se provee', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

    const result = await handler.execute(makeCommand(true));

    expect(result.isSuccess).toBe(true);
    expect(hasher.hash).toHaveBeenCalledTimes(4);
  });

  it('debería hashear dirección, email, RFC y teléfono', async () => {
    churchRepository.findById.mockResolvedValue({ id: CHURCH_ID });

    await handler.execute(makeCommand());

    expect(hasher.hash).toHaveBeenCalledTimes(4);
  });
});
