import { PrintBeneficientsReportHandler } from './print-beneficients-report.handler';
import { PrintBeneficientsReportCommand } from '@/community/application/command/print-beneficients-report.command';
import { BeneficientsReportItemDto } from '@/community/application/dto/beneficients-report.response';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { Readable } from 'stream';

const BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000001';

function makeReportItem(): BeneficientsReportItemDto {
  return {
    beneficientNumber: 5,
    title: 'Sr.',
    firstname: 'Juan',
    firstLastname: 'Pérez',
    secondLastname: null,
    birthday: new Date('1985-01-01'),
    genre: 'MALE',
    maritalStatus: 'Soltero',
    email: null,
    phoneNumber: null,
    street: 'Calle 1',
    noExt: '10',
    noInt: null,
    neighborhood: null,
    locality: null,
    city: 'CDMX',
    state: 'CDMX',
    zipCode: '06600',
    createdAt: new Date(),
    deactivatedAt: null,
    reasonDeactivated: null,
    isActive: true,
    collectorNumber: null,
    collectorFirstname: null,
    collectorFirstLastname: null,
    donationCount: 0,
    donationTotalMxn: 0,
    donationTotalUsd: 0,
    promiseAmount: null,
    currency: null,
    recurring: null,
    recurrence: null,
    promiseIsActive: null,
  };
}

describe('PrintBeneficientsReportHandler', () => {
  let handler: PrintBeneficientsReportHandler;
  let reportService: { getById: jest.Mock };
  let pdfService: { print: jest.Mock };

  const command = new PrintBeneficientsReportCommand(BENEFICIENT_ID);

  beforeEach(() => {
    reportService = { getById: jest.fn() };
    pdfService = {
      print: jest.fn().mockResolvedValue(Readable.from(['%PDF'])),
    };

    handler = new PrintBeneficientsReportHandler(
      reportService as any,
      pdfService as any,
    );
  });

  it('debería fallar con NOT_FOUND cuando el bienhechor no existe', async () => {
    reportService.getById.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería consultar el reporte por el id del comando', async () => {
    reportService.getById.mockResolvedValue(makeReportItem());

    await handler.execute(command);

    expect(reportService.getById).toHaveBeenCalledWith(BENEFICIENT_ID);
  });

  it('debería generar el PDF y devolver el stream en el caso exitoso', async () => {
    const pdfStream = Readable.from(['%PDF-1.4']);
    reportService.getById.mockResolvedValue(makeReportItem());
    pdfService.print.mockResolvedValue(pdfStream);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(pdfStream);
    expect(pdfService.print).toHaveBeenCalledTimes(1);
  });
});
