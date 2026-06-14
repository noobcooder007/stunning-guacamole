import { DeactivateAssignationEventHandler } from './deactivate-assignation-event.handler';
import { CollectorDeactivatedEvent } from '@/community/application/events/collector-deactivated.event';
import { Assignation } from '@/community/domain/aggregate/assignation.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const BID1 = '01907c2a-0000-7000-8000-000000000010';
const AID1 = '01907c2a-0000-7000-8000-000000000020';

function makeAssignation(id: string): Assignation {
  return Assignation.recreate(id, {
    collectorId: CollectorId.of(COLLECTOR_ID),
    beneficientId: BeneficientId.of(BID1),
    isActive: true,
  });
}

describe('DeactivateAssignationEventHandler', () => {
  let handler: DeactivateAssignationEventHandler;
  let assignationRepository: { findActivesByCollectorId: jest.Mock; save: jest.Mock };
  let uow: { runInTransaction: jest.Mock };

  const event = new CollectorDeactivatedEvent(COLLECTOR_ID, 'Colector desactivado');

  beforeEach(() => {
    assignationRepository = {
      findActivesByCollectorId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    uow = {
      runInTransaction: jest.fn().mockImplementation((fn: () => Promise<any>) => fn()),
    };
    handler = new DeactivateAssignationEventHandler(
      assignationRepository as any,
      uow as any,
    );
  });

  it('no debería hacer nada cuando no hay asignaciones activas para el colector', async () => {
    assignationRepository.findActivesByCollectorId.mockResolvedValue([]);

    await handler.handle(event);

    expect(assignationRepository.save).not.toHaveBeenCalled();
  });

  it('debería desactivar todas las asignaciones activas del colector', async () => {
    const a1 = makeAssignation(AID1);
    assignationRepository.findActivesByCollectorId.mockResolvedValue([a1]);

    await handler.handle(event);

    expect(a1.isActive).toBe(false);
    expect(a1.reasonDeactivate).toBe('Colector desactivado');
    expect(assignationRepository.save).toHaveBeenCalledWith([a1]);
  });

  it('debería persistir dentro de una transacción', async () => {
    assignationRepository.findActivesByCollectorId.mockResolvedValue([makeAssignation(AID1)]);

    await handler.handle(event);

    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
  });

  it('debería buscar las asignaciones por collectorId del evento', async () => {
    assignationRepository.findActivesByCollectorId.mockResolvedValue([]);

    await handler.handle(event);

    expect(assignationRepository.findActivesByCollectorId).toHaveBeenCalledWith(COLLECTOR_ID);
  });
});
