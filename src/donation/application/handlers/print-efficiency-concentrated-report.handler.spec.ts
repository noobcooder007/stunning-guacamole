import { Readable } from 'stream';
import { PrintEfficiencyConcentratedReportHandler } from './print-efficiency-concentrated-report.handler';
import { PrintEfficiencyConcentratedReportCommand } from '@/donation/application/command/print-efficiency-concentrated-report.command';
import { EfficiencyType } from '@/donation/domain/constants/efficiency-type.enum';

describe('PrintEfficiencyConcentratedReportHandler', () => {
  let handler: PrintEfficiencyConcentratedReportHandler;
  let reportService: { getReport: jest.Mock };
  let pdfService: { print: jest.Mock };

  beforeEach(() => {
    reportService = { getReport: jest.fn() };
    pdfService = {
      print: jest.fn().mockResolvedValue(Readable.from(['%PDF'])),
    };
    handler = new PrintEfficiencyConcentratedReportHandler(
      reportService as any,
      pdfService as any,
    );
  });

  it('debería generar el PDF con los filtros de fecha, porcentaje y tipo', async () => {
    reportService.getReport.mockResolvedValue({
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      initialPercentage: 0,
      finalPercentage: 50,
      efficiencyType: EfficiencyType.HISTORICAL,
      collectorNum: null,
      rows: [],
    });
    const pdfStream = Readable.from(['%PDF-1.4']);
    pdfService.print.mockResolvedValue(pdfStream);

    const command = new PrintEfficiencyConcentratedReportCommand(
      '2024-01-01',
      '2024-06-30',
      0,
      50,
      EfficiencyType.HISTORICAL,
    );
    const result = await handler.execute(command);

    expect(reportService.getReport).toHaveBeenCalledWith({
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      initialPercentage: 0,
      finalPercentage: 50,
      efficiencyType: EfficiencyType.HISTORICAL,
      collectorNum: undefined,
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(pdfStream);
    expect(pdfService.print).toHaveBeenCalledTimes(1);
  });
});
