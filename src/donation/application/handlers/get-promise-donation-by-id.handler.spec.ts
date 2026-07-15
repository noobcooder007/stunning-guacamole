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

function makeQueryBuilder(getOneResult: unknown) {
  const qb: any = {};
  qb.getOne = jest.fn().mockResolvedValue(getOneResult);
  qb.andWhere = jest.fn().mockReturnValue(qb);
  qb.where = jest.fn().mockReturnValue(qb);
  return qb;
}

function makeDataSource(getOneResult: unknown) {
  const qb = makeQueryBuilder(getOneResult);
  const createQueryBuilder = jest.fn().mockReturnValue(qb);
  const getRepository = jest.fn().mockReturnValue({ createQueryBuilder });
  return { getRepository, __qb: qb } as any;
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

  describe('scoping por identidad', () => {
    const OWN_BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000002';
    const OTHER_BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000099';

    it('debería agregar el filtro de beneficientId cuando viene scopedBeneficientId', async () => {
      const row = makePromiseRow();
      const datasource = makeDataSource(row);

      const handler = new GetPromiseDonationByIdHandler(datasource);
      const result = await handler.execute(
        new GetPromiseDonationByIdQuery(PROMISE_ID, OWN_BENEFICIENT_ID),
      );

      expect(datasource.__qb.andWhere).toHaveBeenCalledWith(
        'promise.beneficientId = :beneficientId',
        { beneficientId: OWN_BENEFICIENT_ID },
      );
      expect(result.isSuccess).toBe(true);
    });

    it('debería devolver NOT_FOUND cuando la promesa pertenece a otro bienhechor', async () => {
      const datasource = makeDataSource(null);

      const handler = new GetPromiseDonationByIdHandler(datasource);
      const result = await handler.execute(
        new GetPromiseDonationByIdQuery(PROMISE_ID, OTHER_BENEFICIENT_ID),
      );

      expect(result.isSuccess).toBe(false);
      expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    });

    it('no debería agregar ningún andWhere cuando no hay scope', async () => {
      const datasource = makeDataSource(makePromiseRow());

      const handler = new GetPromiseDonationByIdHandler(datasource);
      await handler.execute(new GetPromiseDonationByIdQuery(PROMISE_ID));

      expect(datasource.__qb.andWhere).not.toHaveBeenCalled();
    });
  });
});
