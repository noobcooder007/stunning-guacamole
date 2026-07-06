import { GetCurrentPeriodHandler } from './get-current-period.handler';
import { GetCurrentPeriodQuery } from '@/donation/application/query/get-current-period.query';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import {
  CollectionPeriod,
  CollectionPeriodId,
} from '@/donation/domain/aggregates/collection-period.aggregate';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';

function makeOpenPeriod(): CollectionPeriod {
  return CollectionPeriod.recreate(CollectionPeriodId.of(PERIOD_ID), {
    month: 6,
    year: 2026,
    status: 'OPEN',
    createdAt: new Date('2026-06-01'),
    createdBy: UserId.of(USER_ID),
  });
}

describe('GetCurrentPeriodHandler', () => {
  let handler: GetCurrentPeriodHandler;
  let periodRepository: { findOpen: jest.Mock };
  let receiptRepo: { count: jest.Mock };
  const query = new GetCurrentPeriodQuery();

  beforeEach(() => {
    periodRepository = { findOpen: jest.fn() };
    receiptRepo = { count: jest.fn().mockResolvedValue(5) };
    handler = new GetCurrentPeriodHandler(
      {} as any,
      periodRepository as any,
      receiptRepo as any,
    );
  });

  it('debería retornar null cuando no hay período abierto', async () => {
    periodRepository.findOpen.mockResolvedValue(null);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeNull();
  });

  it('debería retornar el período con el conteo de recibos pendientes', async () => {
    periodRepository.findOpen.mockResolvedValue(makeOpenPeriod());
    receiptRepo.count.mockResolvedValue(3);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe(PERIOD_ID);
    expect(result.value.month).toBe(6);
    expect(result.value.year).toBe(2026);
    expect(result.value.status).toBe('OPEN');
    expect(result.value.pendingReceiptsCount).toBe(3);
  });

  it('debería consultar recibos con el mes y año del período abierto', async () => {
    periodRepository.findOpen.mockResolvedValue(makeOpenPeriod());

    await handler.execute(query);

    expect(receiptRepo.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ periodMonth: 6, periodYear: 2026 }),
      }),
    );
  });
});
