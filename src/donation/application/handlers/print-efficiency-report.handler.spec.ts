import { Readable } from 'stream';
import { PrintEfficiencyReportHandler } from './print-efficiency-report.handler';
import { PrintEfficiencyReportCommand } from '@/donation/application/command/print-efficiency-report.command';

describe('PrintEfficiencyReportHandler', () => {
  let handler: PrintEfficiencyReportHandler;
  let reportService: { getReport: jest.Mock };
  let pdfService: { print: jest.Mock };

  beforeEach(() => {
    reportService = { getReport: jest.fn() };
    pdfService = {
      print: jest.fn().mockResolvedValue(Readable.from(['%PDF'])),
    };
    handler = new PrintEfficiencyReportHandler(
      reportService as any,
      pdfService as any,
    );
  });

  it('debería generar el PDF con los filtros solicitados', async () => {
    reportService.getReport.mockResolvedValue({
      month: 6,
      year: 2026,
      initialDonation: 100,
      finalDonation: 500,
      frequency: 1,
      collectorNum: 3,
      collectors: [],
      totals: {
        assignedAmount: 0,
        assignedCount: 0,
        collectedAmount: 0,
        collectedCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
        collectionRate: 0,
      },
    });
    const pdfStream = Readable.from(['%PDF-1.4']);
    pdfService.print.mockResolvedValue(pdfStream);

    const command = new PrintEfficiencyReportCommand(6, 2026, 100, 500, 1, 3);
    const result = await handler.execute(command);

    expect(reportService.getReport).toHaveBeenCalledWith({
      month: 6,
      year: 2026,
      initialDonation: 100,
      finalDonation: 500,
      frequency: 1,
      collectorNum: 3,
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(pdfStream);
    expect(pdfService.print).toHaveBeenCalledTimes(1);
  });

  it('debería generar el PDF sin filtrar por colector cuando collectorNum no se envía', async () => {
    reportService.getReport.mockResolvedValue({
      month: 6,
      year: 2026,
      initialDonation: 100,
      finalDonation: 500,
      frequency: 1,
      collectorNum: null,
      collectors: [],
      totals: {
        assignedAmount: 0,
        assignedCount: 0,
        collectedAmount: 0,
        collectedCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
        collectionRate: 0,
      },
    });

    const command = new PrintEfficiencyReportCommand(6, 2026, 100, 500, 1);
    const result = await handler.execute(command);

    expect(reportService.getReport).toHaveBeenCalledWith(
      expect.objectContaining({ collectorNum: undefined }),
    );
    expect(result.isSuccess).toBe(true);
  });
});
