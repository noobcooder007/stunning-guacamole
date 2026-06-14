import { MarkAsPaidReceiptsCommandHandler } from './mark-as-paid-receipts.handler';
import { MarkAsPaidReceiptsCommand } from '@/donation/application/command/mark-as-paid-receipts.command';

function makeReceipt(folio: string, status: string, month = 6, year = 2026) {
  return {
    status,
    folio: { unpack: () => folio },
    markAsPaid: jest.fn(),
    periodMonth: month,
    periodYear: year,
  };
}

function makeOpenPeriod(month = 6, year = 2026) {
  return { _id: { unpack: () => 'period-1' }, month, year };
}

describe('MarkAsPaidReceiptsCommandHandler', () => {
  let handler: MarkAsPaidReceiptsCommandHandler;
  let receiptRepository: { findByFolios: jest.Mock; save: jest.Mock };
  let periodRepository: { findOpen: jest.Mock };
  let uow: { runInTransaction: jest.Mock };

  beforeEach(() => {
    receiptRepository = {
      findByFolios: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    periodRepository = { findOpen: jest.fn() };
    uow = {
      runInTransaction: jest.fn().mockImplementation((fn: () => Promise<any>) => fn()),
    };
    handler = new MarkAsPaidReceiptsCommandHandler(
      receiptRepository as any,
      periodRepository as any,
      uow as any,
    );
  });

  it('debería retornar ok con listas vacías cuando no hay recibos', async () => {
    receiptRepository.findByFolios.mockResolvedValue([]);
    periodRepository.findOpen.mockResolvedValue(null);

    const result = await handler.execute(
      new MarkAsPaidReceiptsCommand([{ receiptFolio: 'F-001', paymentMethod: 'CASH' }]),
    );

    expect(result.isSuccess).toBe(true);
    expect(result.value.currentPeriod).toHaveLength(0);
    expect(result.value.previousPeriods).toHaveLength(0);
  });

  it('debería clasificar recibos del período actual en currentPeriod', async () => {
    const receipt = makeReceipt('F-001', 'PENDING', 6, 2026);
    receiptRepository.findByFolios.mockResolvedValue([receipt]);
    periodRepository.findOpen.mockResolvedValue(makeOpenPeriod(6, 2026));

    const result = await handler.execute(
      new MarkAsPaidReceiptsCommand([{ receiptFolio: 'F-001', paymentMethod: 'CASH' }]),
    );

    expect(result.isSuccess).toBe(true);
    expect(result.value.currentPeriod).toContain('F-001');
    expect(result.value.previousPeriods).toHaveLength(0);
    expect(receipt.markAsPaid).toHaveBeenCalledWith('CASH', 'period-1', undefined);
  });

  it('debería clasificar recibos de períodos anteriores en previousPeriods', async () => {
    const receipt = makeReceipt('F-002', 'PENDING', 5, 2026);
    receiptRepository.findByFolios.mockResolvedValue([receipt]);
    periodRepository.findOpen.mockResolvedValue(makeOpenPeriod(6, 2026));

    const result = await handler.execute(
      new MarkAsPaidReceiptsCommand([{ receiptFolio: 'F-002', paymentMethod: 'TRANSFER' }]),
    );

    expect(result.value.currentPeriod).toHaveLength(0);
    expect(result.value.previousPeriods).toContain('F-002');
  });

  it('debería omitir recibos que no estén en estado PENDING', async () => {
    const paid = makeReceipt('F-003', 'PAID');
    const pending = makeReceipt('F-004', 'PENDING', 6, 2026);
    receiptRepository.findByFolios.mockResolvedValue([paid, pending]);
    periodRepository.findOpen.mockResolvedValue(makeOpenPeriod(6, 2026));

    const result = await handler.execute(
      new MarkAsPaidReceiptsCommand([
        { receiptFolio: 'F-003', paymentMethod: 'CASH' },
        { receiptFolio: 'F-004', paymentMethod: 'CASH' },
      ]),
    );

    expect(paid.markAsPaid).not.toHaveBeenCalled();
    expect(pending.markAsPaid).toHaveBeenCalled();
    expect(result.value.currentPeriod).toContain('F-004');
  });
});
