import { GetPromiseDonationByIdHandler } from './get-promise-donation-by-id.handler';
import { GetPromiseDonationByIdQuery } from '@/donation/application/query/get-promise-donation-by-id.query';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const PROMISE_ID = '01907c2a-0000-7000-8000-000000000001';

function makePromiseRow() {
  return {
    id: PROMISE_ID,
    beneficientId: '01907c2a-0000-7000-8000-000000000002',
    promiseAmount: 500,
    currency: 'MXN',
    method: 'CASH',
    startDate: new Date('2026-01-01'),
    recurring: true,
    recurrence: 1,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    lastDonation: null,
    nextDonation: new Date('2026-01-01'),
    reasonDeactivate: null,
  };
}

function makeDataSource(getOneResult: unknown) {
  const getOne = jest.fn().mockResolvedValue(getOneResult);
  const where = jest.fn().mockReturnValue({ getOne });
  const createQueryBuilder = jest.fn().mockReturnValue({ where });
  const getRepository = jest.fn().mockReturnValue({ createQueryBuilder });
  return { getRepository } as any;
}

describe('GetPromiseDonationByIdHandler', () => {
  it('debería devolver NOT_FOUND cuando la promesa no existe', async () => {
    const handler = new GetPromiseDonationByIdHandler(makeDataSource(null));

    const result = await handler.execute(
      new GetPromiseDonationByIdQuery(PROMISE_ID),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(result.error.entity).toBe('PromiseDonation');
  });

  it('debería devolver la promesa cuando existe', async () => {
    const row = makePromiseRow();
    const handler = new GetPromiseDonationByIdHandler(makeDataSource(row));

    const result = await handler.execute(
      new GetPromiseDonationByIdQuery(PROMISE_ID),
    );

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(row);
  });

  it('debería buscar por el id recibido en el query', async () => {
    const getOne = jest.fn().mockResolvedValue(null);
    const where = jest.fn().mockReturnValue({ getOne });
    const createQueryBuilder = jest.fn().mockReturnValue({ where });
    const getRepository = jest.fn().mockReturnValue({ createQueryBuilder });
    const datasource = { getRepository } as any;

    const handler = new GetPromiseDonationByIdHandler(datasource);
    await handler.execute(new GetPromiseDonationByIdQuery(PROMISE_ID));

    expect(where).toHaveBeenCalledWith('promise.id = :id', { id: PROMISE_ID });
  });
});
