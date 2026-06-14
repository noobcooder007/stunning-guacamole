import { CancelReceiptCommandHandler } from './cancel-receipt.handler';
import { CancelReceiptCommand } from '@/donation/application/command/cancel-receipt.command';

const RECEIPT_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';

function makeReceipt(folio = 'F-001') {
  return {
    cancel: jest.fn(),
    folio: { unpack: () => folio },
  };
}

describe('CancelReceiptCommandHandler', () => {
  let handler: CancelReceiptCommandHandler;
  let receiptRepository: { findById: jest.Mock; save: jest.Mock };

  const command = new CancelReceiptCommand(RECEIPT_ID, 'Error en captura', USER_ID);

  beforeEach(() => {
    receiptRepository = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CancelReceiptCommandHandler(receiptRepository as any);
  });

  it('debería retornar ok con null cuando el recibo no existe (idempotente)', async () => {
    receiptRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeNull();
    expect(receiptRepository.save).not.toHaveBeenCalled();
  });

  it('debería cancelar el recibo, guardarlo y devolver el folio', async () => {
    const receipt = makeReceipt('F-042');
    receiptRepository.findById.mockResolvedValue(receipt);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe('F-042');
    expect(receipt.cancel).toHaveBeenCalledWith('Error en captura', USER_ID);
    expect(receiptRepository.save).toHaveBeenCalledWith(receipt);
  });

  it('debería buscar el recibo por receiptId del comando', async () => {
    receiptRepository.findById.mockResolvedValue(null);

    await handler.execute(command);

    expect(receiptRepository.findById).toHaveBeenCalledWith(RECEIPT_ID);
  });
});
