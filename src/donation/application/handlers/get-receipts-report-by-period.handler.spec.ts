import { GetReceiptsReportByPeriodHandler } from './get-receipts-report-by-period.handler';
import { GetReceiptsReportByPeriodQuery } from '@/donation/application/query/get-receipts-report-by-period.query';

describe('GetReceiptsReportByPeriodHandler', () => {
  let handler: GetReceiptsReportByPeriodHandler;
  let reportService: { getReportByPeriod: jest.Mock };

  beforeEach(() => {
    reportService = { getReportByPeriod: jest.fn() };
    handler = new GetReceiptsReportByPeriodHandler(reportService as any);
  });

  it('debería delegar al servicio con mes y año de la query', async () => {
    const expected = { totalAmount: 5000, receiptCount: 10 };
    reportService.getReportByPeriod.mockResolvedValue(expected);
    const query = new GetReceiptsReportByPeriodQuery(6, 2026);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(reportService.getReportByPeriod).toHaveBeenCalledWith(6, 2026);
  });
});
