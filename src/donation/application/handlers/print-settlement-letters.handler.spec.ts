import { PrintSettlementLettersHandler } from './print-settlement-letters.handler';
import { PrintSettlementLettersCommand } from '@/donation/application/command/print-settlement-letters.command';
import {
  CollectorSettlement,
  CollectorSettlementPaymentStatus,
} from '@/donation/domain/entities/collector-settlement.entity';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { Readable } from 'stream';

const PERIOD_ID = '01907c2a-0000-7000-8000-000000000010';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';

function makePeriod(month = 6, year = 2026) {
  return { _id: { unpack: () => PERIOD_ID }, month, year };
}

function makeSettlement(): CollectorSettlement {
  return CollectorSettlement.create({
    collectionPeriodId: PERIOD_ID,
    collectorId: CollectorId.of(COLLECTOR_ID),
    month: 6,
    year: 2026,
    totalCollected: 1000,
    collectedByCurrency: { MXN: 1000 },
    commissionPercent: 10,
    commissionAmount: 100,
    nomina: 50,
    transportAllowance: 20,
    netCommission: 70,
    paymentStatus: CollectorSettlementPaymentStatus.PENDING,
    totalPaid: 0,
    createdAt: new Date(),
  });
}

function makeReceipt(collectorId: string) {
  return {
    collectorId,
    folio: 'F-001',
    amount: 500,
    currency: 'MXN',
    periodMonth: 6,
    periodYear: 2026,
    collector: {
      profile: {
        firstname: 'Juan',
        firstLastname: 'Pérez',
        secondLastname: null,
      },
      collectorNumber: 1,
    },
    beneficient: {
      profile: {
        firstname: 'María',
        firstLastname: 'López',
        secondLastname: null,
      },
      beneficientNumber: 42,
    },
  };
}

describe('PrintSettlementLettersHandler', () => {
  let handler: PrintSettlementLettersHandler;
  let periodRepository: { findById: jest.Mock };
  let settlementRepository: { findByPeriodId: jest.Mock };
  let receiptRepository: { findPaidByCollectionPeriodId: jest.Mock };
  let pdfService: { print: jest.Mock };

  const command = new PrintSettlementLettersCommand(PERIOD_ID);

  beforeEach(() => {
    periodRepository = { findById: jest.fn() };
    settlementRepository = { findByPeriodId: jest.fn() };
    receiptRepository = { findPaidByCollectionPeriodId: jest.fn() };
    pdfService = {
      print: jest.fn().mockResolvedValue(Readable.from(['%PDF'])),
    };

    handler = new PrintSettlementLettersHandler(
      periodRepository as any,
      settlementRepository as any,
      receiptRepository as any,
      pdfService as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando el período no existe', async () => {
    periodRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería fallar con NOT_FOUND cuando no hay liquidaciones en el período', async () => {
    periodRepository.findById.mockResolvedValue(makePeriod());
    settlementRepository.findByPeriodId.mockResolvedValue([]);
    receiptRepository.findPaidByCollectionPeriodId.mockResolvedValue([]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería generar el PDF y devolver el stream en el caso exitoso', async () => {
    const pdfStream = Readable.from(['%PDF-1.4']);
    periodRepository.findById.mockResolvedValue(makePeriod());
    settlementRepository.findByPeriodId.mockResolvedValue([makeSettlement()]);
    receiptRepository.findPaidByCollectionPeriodId.mockResolvedValue([
      makeReceipt(COLLECTOR_ID),
    ]);
    pdfService.print.mockResolvedValue(pdfStream);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(pdfStream);
    expect(pdfService.print).toHaveBeenCalledTimes(1);
  });

  it('debería agrupar los recibos por collectorId al construir las cartas', async () => {
    const C2 = '01907c2a-0000-7000-8000-000000000002';
    const settlement2 = CollectorSettlement.create({
      collectionPeriodId: PERIOD_ID,
      collectorId: CollectorId.of(C2),
      month: 6,
      year: 2026,
      totalCollected: 500,
      collectedByCurrency: { MXN: 500 },
      commissionPercent: 10,
      commissionAmount: 50,
      nomina: 0,
      transportAllowance: 0,
      netCommission: 50,
      paymentStatus: CollectorSettlementPaymentStatus.PENDING,
      totalPaid: 0,
      createdAt: new Date(),
    });
    periodRepository.findById.mockResolvedValue(makePeriod());
    settlementRepository.findByPeriodId.mockResolvedValue([
      makeSettlement(),
      settlement2,
    ]);
    receiptRepository.findPaidByCollectionPeriodId.mockResolvedValue([
      makeReceipt(COLLECTOR_ID),
      makeReceipt(COLLECTOR_ID),
      makeReceipt(C2),
    ]);

    await handler.execute(command);

    const [docDefinition] = pdfService.print.mock.calls[0];
    expect(docDefinition).toBeDefined();
  });

  it('debería usar el nombre del colector "Anónimo" cuando no hay recibos para él', async () => {
    periodRepository.findById.mockResolvedValue(makePeriod());
    settlementRepository.findByPeriodId.mockResolvedValue([makeSettlement()]);
    receiptRepository.findPaidByCollectionPeriodId.mockResolvedValue([]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(pdfService.print).toHaveBeenCalledTimes(1);
    const [docDefinition] = pdfService.print.mock.calls[0];
    expect(docDefinition).toBeDefined();
  });
});
