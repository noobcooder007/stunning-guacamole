import { Logger } from '@nestjs/common';
import { ReassignBeneficientsToCollectorHandler } from './reassign-beneficients-to-collector.handler';
import { ReassignBeneficientsCommand } from '@/community/application/command/reassign-beneficients.command';
import { AssignationActivatedEvent } from '@/community/application/events/assignation-activated.event';
import {
  Assignation,
} from '@/community/domain/aggregate/assignation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { Result, ErrorType } from '@/shared/domain/dto/result.dto';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

beforeAll(() => jest.spyOn(Logger.prototype, 'log').mockImplementation());
import { AssignationReportResponse } from '@/community/application/dto/assignation-report.response';
import { AssignationServiceResult } from '@/community/domain/services/assignament.service';

const NEW_COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const OLD_COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000002';
const BID1 = '01907c2a-0000-7000-8000-000000000010';
const BID2 = '01907c2a-0000-7000-8000-000000000011';
const AID1 = '01907c2a-0000-7000-8000-000000000020';
const AID2 = '01907c2a-0000-7000-8000-000000000021';

function makeAssignation(
  id: string,
  beneficientId: string,
  isActive: boolean,
): Assignation {
  return Assignation.recreate(id, {
    beneficientId: BeneficientId.of(beneficientId),
    collectorId: CollectorId.of(OLD_COLLECTOR_ID),
    isActive,
  });
}

function makeServiceResult(activatedIds: string[] = []): AssignationServiceResult {
  const report: AssignationReportResponse = {
    addedCount: activatedIds.length,
    alreadyAssignedCount: 0,
    limmiteExceededCount: 0,
    addedIds: { created: activatedIds, reactivated: [] },
    ignoredIds: [],
  };
  return { report, activatedBeneficientIds: activatedIds };
}

describe('ReassignBeneficientsToCollectorHandler', () => {
  let handler: ReassignBeneficientsToCollectorHandler;
  let assignationService: { createOrReactivate: jest.Mock; deactivate: jest.Mock };
  let assignationRepository: { findByIds: jest.Mock };
  let collectorRepository: { isActive: jest.Mock };
  let uow: { runInTransaction: jest.Mock };
  let eventBus: { publish: jest.Mock };

  beforeEach(() => {
    assignationService = {
      createOrReactivate: jest.fn(),
      deactivate: jest.fn().mockResolvedValue(Result.ok()),
    };
    assignationRepository = { findByIds: jest.fn() };
    collectorRepository = { isActive: jest.fn() };
    uow = {
      runInTransaction: jest.fn().mockImplementation((fn: () => Promise<any>) => fn()),
    };
    eventBus = { publish: jest.fn() };

    handler = new ReassignBeneficientsToCollectorHandler(
      assignationService as any,
      assignationRepository as any,
      collectorRepository as any,
      uow as any,
      eventBus as any,
    );
  });

  it('debería lanzar DomainException NOT_FOUND cuando el colector destino no está activo', async () => {
    collectorRepository.isActive.mockResolvedValue(false);
    const command = new ReassignBeneficientsCommand(NEW_COLLECTOR_ID, [
      { assignationId: AID1, reason: 'Traslado' },
    ]);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
    await expect(handler.execute(command)).rejects.toMatchObject({
      type: ErrorType.NOT_FOUND,
    });
  });

  it('debería lanzar DomainException cuando alguna asignación no existe', async () => {
    collectorRepository.isActive.mockResolvedValue(true);
    assignationRepository.findByIds.mockResolvedValue([]);

    const command = new ReassignBeneficientsCommand(NEW_COLLECTOR_ID, [
      { assignationId: AID1, reason: 'Traslado' },
    ]);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('debería desactivar asignaciones activas antes de reasignar', async () => {
    const activeAssignation = makeAssignation(AID1, BID1, true);
    collectorRepository.isActive.mockResolvedValue(true);
    assignationRepository.findByIds.mockResolvedValue([activeAssignation]);
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([])),
    );

    const command = new ReassignBeneficientsCommand(NEW_COLLECTOR_ID, [
      { assignationId: AID1, reason: 'Traslado' },
    ]);
    await handler.execute(command);

    expect(assignationService.deactivate).toHaveBeenCalledWith([
      { assignationId: AID1, reason: 'Traslado' },
    ]);
  });

  it('no debería llamar a deactivate si las asignaciones ya están inactivas', async () => {
    const inactiveAssignation = makeAssignation(AID1, BID1, false);
    collectorRepository.isActive.mockResolvedValue(true);
    assignationRepository.findByIds.mockResolvedValue([inactiveAssignation]);
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([])),
    );

    const command = new ReassignBeneficientsCommand(NEW_COLLECTOR_ID, [
      { assignationId: AID1, reason: 'Traslado' },
    ]);
    await handler.execute(command);

    expect(assignationService.deactivate).not.toHaveBeenCalled();
  });

  it('debería llamar a createOrReactivate con los beneficiarios extraídos de las asignaciones', async () => {
    const a1 = makeAssignation(AID1, BID1, false);
    const a2 = makeAssignation(AID2, BID2, false);
    collectorRepository.isActive.mockResolvedValue(true);
    assignationRepository.findByIds.mockResolvedValue([a1, a2]);
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([])),
    );

    const command = new ReassignBeneficientsCommand(NEW_COLLECTOR_ID, [
      { assignationId: AID1, reason: 'Traslado' },
      { assignationId: AID2, reason: 'Traslado' },
    ]);
    await handler.execute(command);

    expect(assignationService.createOrReactivate).toHaveBeenCalledWith(
      NEW_COLLECTOR_ID,
      expect.arrayContaining([BID1, BID2]),
      { validateCollector: false },
    );
  });

  it('debería lanzar DomainException cuando createOrReactivate falla', async () => {
    const activeAssignation = makeAssignation(AID1, BID1, false);
    collectorRepository.isActive.mockResolvedValue(true);
    assignationRepository.findByIds.mockResolvedValue([activeAssignation]);
    assignationService.createOrReactivate.mockResolvedValue(
      Result.fail({
        message: 'Error',
        entity: 'Assignation',
        type: ErrorType.CONFLICT,
      }),
    );

    const command = new ReassignBeneficientsCommand(NEW_COLLECTOR_ID, [
      { assignationId: AID1, reason: 'Traslado' },
    ]);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('debería publicar AssignationActivatedEvent por cada beneficiario activado', async () => {
    const a = makeAssignation(AID1, BID1, false);
    collectorRepository.isActive.mockResolvedValue(true);
    assignationRepository.findByIds.mockResolvedValue([a]);
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([BID1])),
    );

    const command = new ReassignBeneficientsCommand(NEW_COLLECTOR_ID, [
      { assignationId: AID1, reason: 'Traslado' },
    ]);
    await handler.execute(command);

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ beneficientId: BID1 }),
    );
    const published = eventBus.publish.mock.calls[0][0];
    expect(published).toBeInstanceOf(AssignationActivatedEvent);
  });

  it('debería retornar el reporte de la reasignación', async () => {
    const a = makeAssignation(AID1, BID1, false);
    collectorRepository.isActive.mockResolvedValue(true);
    assignationRepository.findByIds.mockResolvedValue([a]);
    assignationService.createOrReactivate.mockResolvedValue(
      Result.ok(makeServiceResult([BID1])),
    );

    const command = new ReassignBeneficientsCommand(NEW_COLLECTOR_ID, [
      { assignationId: AID1, reason: 'Traslado' },
    ]);
    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value.addedCount).toBe(1);
  });
});
