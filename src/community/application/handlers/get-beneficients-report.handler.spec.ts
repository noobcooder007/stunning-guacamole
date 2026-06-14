import { GetBeneficientsReportHandler } from './get-beneficients-report.handler';
import { GetBeneficientsReportQuery } from '@/community/application/query/get-beneficients-report.query';

describe('GetBeneficientsReportHandler', () => {
  let handler: GetBeneficientsReportHandler;
  let reportService: { getReport: jest.Mock };

  beforeEach(() => {
    reportService = { getReport: jest.fn() };
    handler = new GetBeneficientsReportHandler({} as any, reportService as any);
  });

  it('debería delegar al servicio y devolver Result.ok', async () => {
    const expected = { data: [], total: 0, page: 1, limit: 20 };
    reportService.getReport.mockResolvedValue(expected);
    const query = new GetBeneficientsReportQuery(1, 20);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(reportService.getReport).toHaveBeenCalledWith(1, 20);
  });
});
