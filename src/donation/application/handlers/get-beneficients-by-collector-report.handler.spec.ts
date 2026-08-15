import { GetBeneficientsByCollectorReportHandler } from './get-beneficients-by-collector-report.handler';
import { GetBeneficientsByCollectorReportQuery } from '@/donation/application/query/get-beneficients-by-collector-report.query';

describe('GetBeneficientsByCollectorReportHandler', () => {
  let handler: GetBeneficientsByCollectorReportHandler;
  let reportService: { getReport: jest.Mock };

  beforeEach(() => {
    reportService = { getReport: jest.fn() };
    handler = new GetBeneficientsByCollectorReportHandler(reportService as any);
  });

  it('debería delegar al servicio con los filtros de la query', async () => {
    const expected = { collectors: [] };
    reportService.getReport.mockResolvedValue(expected);
    const query = new GetBeneficientsByCollectorReportQuery(
      1,
      2026,
      6,
      2026,
      false,
      3,
    );

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(reportService.getReport).toHaveBeenCalledWith(
      1,
      2026,
      6,
      2026,
      false,
      3,
    );
  });

  it('debería delegar sin collectorNumber cuando no se filtra por colector', async () => {
    reportService.getReport.mockResolvedValue({ collectors: [] });
    const query = new GetBeneficientsByCollectorReportQuery(
      1,
      2026,
      6,
      2026,
      true,
    );

    await handler.execute(query);

    expect(reportService.getReport).toHaveBeenCalledWith(
      1,
      2026,
      6,
      2026,
      true,
      undefined,
    );
  });
});
