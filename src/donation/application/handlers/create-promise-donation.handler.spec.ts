import { CreatePromiseDonationHandler } from './create-promise-donation.handler';
import { CreatePromiseDonationCommand } from '@/donation/application/command/create-promise-donation.command';
import { Result, ErrorType } from '@/shared/domain/dto/result.dto';

const BID = '01907c2a-0000-7000-8000-000000000010';
const CREATED_BY = '01907c2a-0000-7000-8000-000000000020';
const FUTURE_DATE = new Date('2099-01-01');

function makeCommand(): CreatePromiseDonationCommand {
  return new CreatePromiseDonationCommand(
    BID,
    100,
    'MXN',
    'CASH',
    FUTURE_DATE,
    true,
    1,
    CREATED_BY,
  );
}

describe('CreatePromiseDonationHandler', () => {
  let handler: CreatePromiseDonationHandler;
  let promiseDonationRepository: { exists: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    promiseDonationRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CreatePromiseDonationHandler(promiseDonationRepository as any);
  });

  it('debería crear y guardar la promesa en el caso exitoso', async () => {
    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBeDefined();
    expect(promiseDonationRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debería fallar con CONFLICT cuando ya existe una promesa para el beneficiario', async () => {
    promiseDonationRepository.exists.mockResolvedValue(true);

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
    expect(promiseDonationRepository.save).not.toHaveBeenCalled();
  });

  it('debería verificar existencia con el beneficientId del comando', async () => {
    await handler.execute(makeCommand());

    expect(promiseDonationRepository.exists).toHaveBeenCalledWith(BID);
  });
});
