import { Readable } from 'stream';
import { PrintBeneficientsByCollectorReportHandler } from './print-beneficients-by-collector-report.handler';
import { PrintBeneficientsByCollectorReportCommand } from '@/donation/application/command/print-beneficients-by-collector-report.command';

describe('PrintBeneficientsByCollectorReportHandler', () => {
  let handler: PrintBeneficientsByCollectorReportHandler;
  let reportService: { getReport: jest.Mock };
  let pdfService: { print: jest.Mock };

  beforeEach(() => {
    reportService = { getReport: jest.fn() };
    pdfService = {
      print: jest.fn().mockResolvedValue(Readable.from(['%PDF'])),
    };
    handler = new PrintBeneficientsByCollectorReportHandler(
      reportService as any,
      pdfService as any,
    );
  });

  it('debería generar el PDF con los datos del rango solicitado', async () => {
    reportService.getReport.mockResolvedValue({
      fromMonth: 1,
      fromYear: 2026,
      toMonth: 6,
      toYear: 2026,
      includeSpecial: false,
      collectors: [],
    });
    const pdfStream = Readable.from(['%PDF-1.4']);
    pdfService.print.mockResolvedValue(pdfStream);

    const result = await handler.execute(
      new PrintBeneficientsByCollectorReportCommand(1, 2026, 6, 2026, false, 3),
    );

    expect(reportService.getReport).toHaveBeenCalledWith(
      1,
      2026,
      6,
      2026,
      false,
      3,
    );
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(pdfStream);
    expect(pdfService.print).toHaveBeenCalledTimes(1);
  });
});
