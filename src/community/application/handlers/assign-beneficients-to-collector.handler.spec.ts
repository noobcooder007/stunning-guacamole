import { AssignBeneficientsToCollectorHandler } from './assign-beneficients-to-collector.handler';
import { AssignBeneficientsCommand } from '@/community/application/command/assign-beneficients.command';
import { AssignationActivatedEvent } from '@/community/application/events/assignation-activated.event';
import { Result, ErrorType } from '@/shared/domain/dto/result.dto';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { AssignationReportResponse } from '@/community/application/dto/assignation-report.response';
import { AssignationServiceResult } from '@/community/domain/services/assignament.service';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const BID1 = '01907c2a-0000-7000-8000-000000000010';
const BID2 = '01907c2a-0000-7000-8000-000000000011';

function makeServiceResult(
  activatedIds: string[] = [],
  createdIds: string[] = [],
): AssignationServiceResult {
  const report: AssignationReportResponse = {
    addedCount: createdIds.length,
    alreadyAssignedCount: 0,
    limmiteExceededCount: 0,
    addedIds: { created: createdIds, reactivated: [] },
    ignoredIds: [],
  };
  return { report, activatedBeneficientIds: activatedIds };
}

describe('AssignBeneficientsToCollectorHandler', () => {
  let handler: AssignBeneficientsToCollectorHandler;
  let assignationService: { createOrReactivate: jest.Mock };
  let uow: { runInTransaction: jest.Mock };
  let eventBus: { publish: jest.Mock };

  beforeEach(() => {
    assignationService = { createOrReactivate: jest.fn() };
    uow = {
      runInTransaction: jest.fn().mockImplementation((fn: () => Promise<any>) => fn()),
    };
    eventBus = { publish: jest.fn() };

    handler = new AssignBeneficientsToCollectorHandler(
      assignationService as any,
      uow as any,
      eventBus as any,
    );
  });

  it('debería devolver Result.ok cuando el servicio tiene éxito sin activados', async () => {
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([], [BID1])),
    );
    const command = new AssignBeneficientsCommand(COLLECTOR_ID, [BID1]);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('debería publicar un AssignationActivatedEvent por cada beneficiario activado', async () => {
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([BID1, BID2], [BID1, BID2])),
    );
    const command = new AssignBeneficientsCommand(COLLECTOR_ID, [BID1, BID2]);

    await handler.execute(command);

    expect(eventBus.publish).toHaveBeenCalledTimes(2);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ beneficientId: BID1 }),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ beneficientId: BID2 }),
    );
  });

  it('debería publicar instancias de AssignationActivatedEvent', async () => {
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([BID1], [BID1])),
    );
    const command = new AssignBeneficientsCommand(COLLECTOR_ID, [BID1]);

    await handler.execute(command);

    const published = eventBus.publish.mock.calls[0][0];
    expect(published).toBeInstanceOf(AssignationActivatedEvent);
  });

  it('debería lanzar DomainException cuando el servicio falla', async () => {
    assignationService.createOrReactivate.mockResolvedValue(
      Result.fail({
        message: 'Collector not found',
        entity: 'Collector',
        type: ErrorType.NOT_FOUND,
      }),
    );
    const command = new AssignBeneficientsCommand(COLLECTOR_ID, [BID1]);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('debería propagar el tipo de error correcto en la DomainException', async () => {
    assignationService.createOrReactivate.mockResolvedValue(
      Result.fail({
        message: 'Beneficients not found',
        entity: 'Beneficient',
        type: ErrorType.NOT_FOUND,
      }),
    );
    const command = new AssignBeneficientsCommand(COLLECTOR_ID, [BID1]);

    await expect(handler.execute(command)).rejects.toMatchObject({
      type: ErrorType.NOT_FOUND,
    });
  });

  it('debería llamar a createOrReactivate con los IDs del command', async () => {
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([], [])),
    );
    const command = new AssignBeneficientsCommand(COLLECTOR_ID, [BID1, BID2]);

    await handler.execute(command);

    expect(assignationService.createOrReactivate).toHaveBeenCalledWith(
      COLLECTOR_ID,
      [BID1, BID2],
    );
  });
});
