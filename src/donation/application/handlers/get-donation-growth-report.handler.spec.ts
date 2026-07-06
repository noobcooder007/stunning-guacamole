import { GetDonationGrowthReportHandler } from './get-donation-growth-report.handler';
import { GetDonationGrowthReportQuery } from '@/donation/application/query/get-donation-growth-report.query';

describe('GetDonationGrowthReportHandler', () => {
  let handler: GetDonationGrowthReportHandler;
  let reportService: { getReport: jest.Mock };

  beforeEach(() => {
    reportService = { getReport: jest.fn() };
    handler = new GetDonationGrowthReportHandler(reportService as any);
  });

  it('debería delegar al servicio con mes y año de la query', async () => {
    const expected = {
      currentPeriod: {
        month: 6,
        year: 2026,
        totalReceipts: 1000,
        newPromiseAmount: 200,
      },
      previousPeriod: {
        month: 5,
        year: 2026,
        totalReceipts: 800,
        newPromiseAmount: 150,
      },
      receiptsVariation: { amount: 200, percentage: 25 },
      promiseAmountVariation: { amount: 50, percentage: 33.33 },
    };
    reportService.getReport.mockResolvedValue(expected);
    const query = new GetDonationGrowthReportQuery(6, 2026);

    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expected);
    expect(reportService.getReport).toHaveBeenCalledWith(6, 2026);
  });
});
