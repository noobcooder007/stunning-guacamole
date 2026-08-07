import { PrintDeliveryLettersHandler } from './print-delivery-letters.handler';
import { PrintDeliveryLettersCommand } from '@/donation/application/command/print-delivery-letters.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { Readable } from 'stream';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';

function makeCollector(collectorNumber = 3) {
  return {
    collectorNumber,
    profile: { firstname: 'Juan', firstLastname: 'Pérez', secondLastname: '' },
  };
}

function makeReceipt(overrides: Record<string, any> = {}) {
  return {
    folio: 'F-001',
    printCount: 1,
    amount: 500,
    currency: 'MXN',
    periodMonth: 6,
    periodYear: 2026,
    collectorId: COLLECTOR_ID,
    collector: makeCollector(),
    beneficient: {
      beneficientNumber: 42,
      profile: { firstname: 'María', firstLastname: 'López', secondLastname: '' },
    },
    promiseDonation: null,
    ...overrides,
  };
}

describe('PrintDeliveryLettersHandler', () => {
  let handler: PrintDeliveryLettersHandler;
  let receiptRepository: {
    findAllForPrint: jest.Mock;
    findOverdueUnpaid: jest.Mock;
  };
  let pdfService: { print: jest.Mock };

  const command = new PrintDeliveryLettersCommand(6, 2026);

  beforeEach(() => {
    receiptRepository = {
      findAllForPrint: jest.fn(),
      findOverdueUnpaid: jest.fn(),
    };
    pdfService = { print: jest.fn().mockResolvedValue(Readable.from(['%PDF'])) };
    handler = new PrintDeliveryLettersHandler(
      receiptRepository as any,
      pdfService as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando no hay recibos actuales ni vencidos', async () => {
    receiptRepository.findAllForPrint.mockResolvedValue([]);
    receiptRepository.findOverdueUnpaid.mockResolvedValue([]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería fallar con VALIDATION y un mensaje legible cuando hay recibos sin imprimir', async () => {
    receiptRepository.findAllForPrint.mockResolvedValue([
      makeReceipt({ printCount: 0 }),
    ]);
    receiptRepository.findOverdueUnpaid.mockResolvedValue([]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.VALIDATION);
    expect(result.error.message).toContain('sin imprimir');
    expect(result.error.message).toContain('Juan Pérez');
  });

  it('debería fallar con NOT_FOUND y un mensaje legible cuando ningún recibo tiene colector asociado', async () => {
    receiptRepository.findAllForPrint.mockResolvedValue([
      makeReceipt({ collectorId: null, collector: null }),
    ]);
    receiptRepository.findOverdueUnpaid.mockResolvedValue([]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    expect(result.error.message).toContain('colector válido');
  });

  it('debería generar el PDF cuando hay recibos válidos e impresos', async () => {
    receiptRepository.findAllForPrint.mockResolvedValue([makeReceipt()]);
    receiptRepository.findOverdueUnpaid.mockResolvedValue([]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(pdfService.print).toHaveBeenCalledTimes(1);
  });

  it('debería acumular montos MXN y USD por separado sin sumarlos entre sí', async () => {
    receiptRepository.findAllForPrint.mockResolvedValue([
      makeReceipt({ folio: 'F-001', amount: 500, currency: 'MXN' }),
      makeReceipt({ folio: 'F-002', amount: 20, currency: 'USD' }),
    ]);
    receiptRepository.findOverdueUnpaid.mockResolvedValue([
      makeReceipt({ folio: 'F-003', amount: 100, currency: 'MXN' }),
    ]);

    await handler.execute(command);

    const [docDefinition] = pdfService.print.mock.calls[0];
    const docStr = JSON.stringify(docDefinition);
    expect(docStr).toContain('$500.00 MXN');
    expect(docStr).toContain('$20.00 USD');
    expect(docStr).toContain('$100.00 MXN');
    // Nunca debe aparecer una suma cruzada (ej. 500 + 20 = 520)
    expect(docStr).not.toContain('$520.00');
  });
});
