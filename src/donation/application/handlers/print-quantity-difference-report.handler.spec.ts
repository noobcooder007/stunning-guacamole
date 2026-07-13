import { Readable } from 'stream';
import { PrintQuantityDifferenceReportHandler } from './print-quantity-difference-report.handler';
import { PrintQuantityDifferenceReportCommand } from '@/donation/application/command/print-quantity-difference-report.command';

describe('PrintQuantityDifferenceReportHandler', () => {
  let handler: PrintQuantityDifferenceReportHandler;
  let reportService: { getReport: jest.Mock };
  let pdfService: { print: jest.Mock };

  beforeEach(() => {
    reportService = { getReport: jest.fn() };
    pdfService = {
      print: jest.fn().mockResolvedValue(Readable.from(['%PDF'])),
    };
    handler = new PrintQuantityDifferenceReportHandler(
      reportService as any,
      pdfService as any,
    );
  });

  it('debería generar el PDF con los datos del período solicitado', async () => {
    reportService.getReport.mockResolvedValue({
      month: 6,
      year: 2026,
      periodStatus: 'CLOSED',
      collectors: [],
      totals: {
        assignedAmount: 0,
        assignedCount: 0,
        collectedAmount: 0,
        collectedCount: 0,
        difference: 0,
      },
    });
    const pdfStream = Readable.from(['%PDF-1.4']);
    pdfService.print.mockResolvedValue(pdfStream);

    const result = await handler.execute(
      new PrintQuantityDifferenceReportCommand(6, 2026),
    );

    expect(reportService.getReport).toHaveBeenCalledWith(6, 2026);
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(pdfStream);
    expect(pdfService.print).toHaveBeenCalledTimes(1);
  });
});
