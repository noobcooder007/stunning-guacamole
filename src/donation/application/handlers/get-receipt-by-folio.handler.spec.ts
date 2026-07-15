import { GetReceiptByFolioHandler } from './get-receipt-by-folio.handler';
import { GetReceiptByFolioQuery } from '@/donation/application/query/get-receipt-by-folio.query';
import { ReceiptMapper } from '@/donation/infrastructure/persistence/mappers/receipt.mapper';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const FOLIO = 'ENE2025-001-R-0001';

function makeReceiptRow(overrides = {}) {
  return {
    id: '01907c2a-0000-7000-8000-000000000001',
    status: 'PENDING',
    folio: FOLIO,
    type: 'RECURRING',
    origin: 'PROMISE',
    amount: 500,
    currency: 'MXN',
    paymentMethod: null,
    externalReference: null,
    promiseDonationId: null,
    periodMonth: 1,
    periodYear: 2025,
    beneficientId: '01907c2a-0000-7000-8000-000000000003',
    collectorId: '01907c2a-0000-7000-8000-000000000004',
    collectionPeriodId: null,
    printCount: 0,
    lastPrintedAt: null,
    voidReason: null,
    paidAt: null,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    createdBy: '01907c2a-0000-7000-8000-000000000005',
    updatedBy: '01907c2a-0000-7000-8000-000000000005',
    chainValidator: null,
    ...overrides,
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

describe('GetReceiptByFolioHandler', () => {
  it('debería devolver NOT_FOUND cuando el recibo no existe', async () => {
    const handler = new GetReceiptByFolioHandler(makeDataSource(null));

    const result = await handler.execute(new GetReceiptByFolioQuery(FOLIO));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(result.error.entity).toBe('Receipt');
  });

  it('debería devolver el recibo mapeado cuando existe', async () => {
    const row = makeReceiptRow();
    const handler = new GetReceiptByFolioHandler(makeDataSource(row));

    const result = await handler.execute(new GetReceiptByFolioQuery(FOLIO));

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(ReceiptMapper.toResponse(row as any));
  });

  it('debería buscar por el folio recibido en el query', async () => {
    const getOne = jest.fn().mockResolvedValue(null);
    const where = jest.fn().mockReturnValue({ getOne });
    const createQueryBuilder = jest.fn().mockReturnValue({ where });
    const getRepository = jest.fn().mockReturnValue({ createQueryBuilder });
    const datasource = { getRepository } as any;

    const handler = new GetReceiptByFolioHandler(datasource);
    await handler.execute(new GetReceiptByFolioQuery(FOLIO));

    expect(where).toHaveBeenCalledWith('receipt.folio = :folio', {
      folio: FOLIO,
    });
  });

  describe('scoping por identidad', () => {
    const OWN_BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000003';
    const OTHER_BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000099';
    const OWN_COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000004';

    it('debería agregar el filtro de beneficientId cuando viene scopedBeneficientId', async () => {
      const row = makeReceiptRow({ beneficientId: OWN_BENEFICIENT_ID });
      const datasource = makeDataSource(row);

      const handler = new GetReceiptByFolioHandler(datasource);
      const result = await handler.execute(
        new GetReceiptByFolioQuery(FOLIO, OWN_BENEFICIENT_ID),
      );

      expect(datasource.__qb.andWhere).toHaveBeenCalledWith(
        'receipt.beneficientId = :beneficientId',
        { beneficientId: OWN_BENEFICIENT_ID },
      );
      expect(result.isSuccess).toBe(true);
    });

    it('debería agregar el filtro de collectorId cuando viene scopedCollectorId', async () => {
      const row = makeReceiptRow({ collectorId: OWN_COLLECTOR_ID });
      const datasource = makeDataSource(row);

      const handler = new GetReceiptByFolioHandler(datasource);
      await handler.execute(
        new GetReceiptByFolioQuery(FOLIO, undefined, OWN_COLLECTOR_ID),
      );

      expect(datasource.__qb.andWhere).toHaveBeenCalledWith(
        'receipt.collectorId = :collectorId',
        { collectorId: OWN_COLLECTOR_ID },
      );
    });

    it('debería devolver NOT_FOUND cuando el folio pertenece a otro bienhechor', async () => {
      // El WHERE + AND WHERE con un beneficientId ajeno no matchea ninguna fila.
      const datasource = makeDataSource(null);

      const handler = new GetReceiptByFolioHandler(datasource);
      const result = await handler.execute(
        new GetReceiptByFolioQuery(FOLIO, OTHER_BENEFICIENT_ID),
      );

      expect(result.isSuccess).toBe(false);
      expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    });

    it('no debería agregar ningún andWhere cuando no hay scope', async () => {
      const datasource = makeDataSource(makeReceiptRow());

      const handler = new GetReceiptByFolioHandler(datasource);
      await handler.execute(new GetReceiptByFolioQuery(FOLIO));

      expect(datasource.__qb.andWhere).not.toHaveBeenCalled();
    });
  });
});
