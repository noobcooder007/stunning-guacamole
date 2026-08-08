import { Readable } from 'stream';
import { CreateSpecialReceiptHandler } from './create-special-receipt.handler';
import { CreateSpecialReceiptCommand } from '@/donation/application/command/create-special-receipt.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';

jest.mock('@/shared/infrastructure/utils/fetch-pdf-image.util', () => ({
  fetchPdfCompatibleImage: jest.fn().mockResolvedValue(null),
}));

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000002';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000003';
const OPEN_PERIOD_ID = '01907c2a-0000-7000-8000-000000000004';
const SCHEDULED_PERIOD_ID = '01907c2a-0000-7000-8000-000000000005';

const OPEN_PERIOD = {
  month: 6,
  year: 2026,
  _id: { unpack: () => OPEN_PERIOD_ID },
};

const SCHEDULED_PERIOD = {
  month: 7,
  year: 2026,
  _id: { unpack: () => SCHEDULED_PERIOD_ID },
};

const COLLECTOR = {
  collectorNumber: 3,
  profilePath: 'foto.webp',
};

const BENEFICIENT = {
  beneficientNumber: 10,
  keepPrivate: false,
  profile: {
    firstname: 'María',
    firstLastname: 'López',
    secondLastname: null,
    phoneNumber: { unpack: () => '5555555555' },
    address: {
      street: 'Calle 1',
      numeration: { noExt: '10', noInt: null },
      neighborhood: null,
      locality: null,
      city: 'CDMX',
      state: 'CDMX',
      zipCode: { unpack: () => '06600' },
    },
  },
};

function makeHandler(
  overrides: {
    findOpen?: jest.Mock;
    findScheduled?: jest.Mock;
    pdfPrint?: jest.Mock;
  } = {},
) {
  const receiptRepository = {
    existsSpecial: jest.fn().mockResolvedValue(false),
    save: jest.fn().mockResolvedValue(undefined),
  };
  const folioProvider = {
    generateNext: jest
      .fn()
      .mockResolvedValue({ unpack: () => 'JUN2026-003-S-0001' }),
  };
  const collectorRepository = {
    findById: jest.fn().mockResolvedValue(COLLECTOR),
  };
  const beneficientRepository = {
    findById: jest.fn().mockResolvedValue(BENEFICIENT),
  };
  const periodRepository = {
    findOpen: overrides.findOpen ?? jest.fn().mockResolvedValue(OPEN_PERIOD),
    findScheduled: overrides.findScheduled ?? jest.fn().mockResolvedValue(null),
  };
  const hasher = { hash: jest.fn().mockResolvedValue('hashed-chain-value') };
  const pdfService = {
    print: overrides.pdfPrint ?? jest.fn().mockResolvedValue(Readable.from(['%PDF'])),
  };
  const uow = {
    runInTransaction: jest
      .fn()
      .mockImplementation((fn: () => Promise<any>) => fn()),
  };

  const handler = new CreateSpecialReceiptHandler(
    receiptRepository as any,
    folioProvider as any,
    collectorRepository as any,
    beneficientRepository as any,
    periodRepository as any,
    hasher as any,
    pdfService as any,
    uow as any,
  );

  return { handler, receiptRepository };
}

function makeCommand() {
  return new CreateSpecialReceiptCommand(
    500,
    'MXN',
    BENEFICIENT_ID,
    COLLECTOR_ID,
    USER_ID,
  );
}

describe('CreateSpecialReceiptHandler', () => {
  it('debería fallar con VALIDATION cuando no hay periodo abierto ni programado', async () => {
    const { handler } = makeHandler({
      findOpen: jest.fn().mockResolvedValue(null),
      findScheduled: jest.fn().mockResolvedValue(null),
    });

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.VALIDATION);
  });

  it('debería crear el recibo como PENDING cuando hay periodo abierto', async () => {
    const { handler, receiptRepository } = makeHandler();

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    const savedReceipt = receiptRepository.save.mock.calls[0][0];
    expect(savedReceipt.status).toBe('PENDING');
    expect(savedReceipt.collectionPeriodId).toBe(OPEN_PERIOD_ID);
  });

  it('debería crear el recibo como SCHEDULED cuando no hay periodo abierto pero sí uno programado', async () => {
    const { handler, receiptRepository } = makeHandler({
      findOpen: jest.fn().mockResolvedValue(null),
      findScheduled: jest.fn().mockResolvedValue(SCHEDULED_PERIOD),
    });

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    const savedReceipt = receiptRepository.save.mock.calls[0][0];
    expect(savedReceipt.status).toBe('SCHEDULED');
    expect(savedReceipt.collectionPeriodId).toBe(SCHEDULED_PERIOD_ID);
  });

  it('debería generar el PDF sin marca de agua en la primera impresión', async () => {
    const pdfPrint = jest.fn().mockResolvedValue(Readable.from(['%PDF']));
    const { handler, receiptRepository } = makeHandler({ pdfPrint });

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    // El printCount persistido ya quedó en 1 (se incrementa dentro de la
    // transacción), pero el PDF de esta primera impresión no debe mostrar
    // la marca de "DUPLICADO / REIMPRESIÓN".
    expect(receiptRepository.save.mock.calls[0][0].printCount).toBe(1);
    const docDefinition = pdfPrint.mock.calls[0][0];
    expect(JSON.stringify(docDefinition)).not.toContain('REIMPRESIÓN');
  });

  it('debería incluir el código postal como texto, no como "[object Object]"', async () => {
    const pdfPrint = jest.fn().mockResolvedValue(Readable.from(['%PDF']));
    const { handler } = makeHandler({ pdfPrint });

    const result = await handler.execute(makeCommand());

    expect(result.isSuccess).toBe(true);
    const docDefinition = pdfPrint.mock.calls[0][0];
    const serialized = JSON.stringify(docDefinition);
    expect(serialized).not.toContain('[object Object]');
    expect(serialized).toContain('06600');
  });

  it('debería fallar con PDF_GENERATION_FAILED (no VALIDATION/CONFLICT) cuando el recibo ya se creó pero el PDF falla', async () => {
    const { handler, receiptRepository } = makeHandler({
      pdfPrint: jest.fn().mockRejectedValue(new Error('worker crashed')),
    });

    const result = await handler.execute(makeCommand());

    // El recibo quedó guardado: no se debe reintentar la creación.
    expect(receiptRepository.save).toHaveBeenCalledTimes(1);
    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.PDF_GENERATION_FAILED);
    expect(result.error.message).toContain('JUN2026-003-S-0001');
  });
});
