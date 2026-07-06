import { GetPeriodSettlementsHandler } from './get-period-settlements.handler';
import { GetPeriodSettlementsQuery } from '@/donation/application/query/get-period-settlements.query';
import {
  CollectorSettlement,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';

function makeSettlement(
  totalCollected = 1000,
  netCommission = 70,
): CollectorSettlement {
  return CollectorSettlement.create({
    collectionPeriodId: PERIOD_ID,
    collectorId: CollectorId.of(COLLECTOR_ID),
    month: 6,
    year: 2026,
    totalCollected,
    commissionPercent: 10,
    commissionAmount: 100,
    nomina: 50,
    transportAllowance: 20,
    netCommission,
    paymentStatus: CollectorSettlementPaymentStatus.PENDING,
    totalPaid: 0,
    createdAt: new Date(),
  });
}

describe('GetPeriodSettlementsHandler', () => {
  let handler: GetPeriodSettlementsHandler;
  let settlementRepository: { findByPeriodId: jest.Mock };

  beforeEach(() => {
    settlementRepository = { findByPeriodId: jest.fn() };
    handler = new GetPeriodSettlementsHandler(settlementRepository as any);
  });

  it('debería devolver lista vacía cuando no hay liquidaciones para el período', async () => {
    settlementRepository.findByPeriodId.mockResolvedValue([]);
    const query = new GetPeriodSettlementsQuery(PERIOD_ID);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });

  it('debería mapear las liquidaciones al DTO de respuesta', async () => {
    const settlement = makeSettlement(1000, 70);
    settlementRepository.findByPeriodId.mockResolvedValue([settlement]);
    const query = new GetPeriodSettlementsQuery(PERIOD_ID);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(1);
    const dto = result.value[0];
    expect(dto.collectorId).toBe(COLLECTOR_ID);
    expect(dto.collectionPeriodId).toBe(PERIOD_ID);
    expect(dto.totalCollected).toBe(1000);
    expect(dto.netCommission).toBe(70);
    expect(dto.remainingBalance).toBe(70);
    expect(dto.paymentStatus).toBe(CollectorSettlementPaymentStatus.PENDING);
  });

  it('debería consultar el repositorio con el periodId de la query', async () => {
    settlementRepository.findByPeriodId.mockResolvedValue([]);
    const query = new GetPeriodSettlementsQuery(PERIOD_ID);

    await handler.execute(query);

    expect(settlementRepository.findByPeriodId).toHaveBeenCalledWith(PERIOD_ID);
  });

  it('debería devolver múltiples liquidaciones mapeadas correctamente', async () => {
    settlementRepository.findByPeriodId.mockResolvedValue([
      makeSettlement(500, 35),
      makeSettlement(800, 56),
    ]);
    const query = new GetPeriodSettlementsQuery(PERIOD_ID);

    const result = await handler.execute(query);

    expect(result.value).toHaveLength(2);
    expect(result.value[0].totalCollected).toBe(500);
    expect(result.value[1].totalCollected).toBe(800);
  });
});
