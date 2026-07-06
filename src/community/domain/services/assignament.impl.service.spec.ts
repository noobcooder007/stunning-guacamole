import { AssignamentService } from './assignament.impl.service';
import {
  Assignation,
  AssignationId,
} from '@/community/domain/aggregate/assignation.aggregate';
import {
  Collector,
  CollectorId,
} from '@/community/domain/aggregate/collector.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';
const OTHER_COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000003';
const BID1 = '01907c2a-0000-7000-8000-000000000010';
const BID2 = '01907c2a-0000-7000-8000-000000000011';
const AID1 = '01907c2a-0000-7000-8000-000000000020';
const AID2 = '01907c2a-0000-7000-8000-000000000021';

function makeCollector(existingAssignationIds: string[] = []): Collector {
  return Collector.recreate(COLLECTOR_ID, {
    userId: UserId.of(USER_ID),
    firstname: 'Juan',
    firstLastname: 'Pérez',
    nss: NSS.of('12345678901'),
    nssHash: 'nss-hash',
    address: Address.of({
      street: 'Calle 1',
      numeration: Numeration.of({ noExt: '10', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'addr-hash',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'phone-hash',
    paymentData: PaymentData.of({
      commissionPercent: 10,
      bank: 'BBVA',
      reference: 'REF001',
      nomina: 100,
      transportAllowance: 50,
    }),
    profilePath: '/profiles/pic.jpg',
    assignations: new Set(
      existingAssignationIds.map((id) => AssignationId.of(id)),
    ),
    isActive: true,
  });
}

function makeAssignation(
  id: string,
  beneficientId: string,
  collectorId: string,
  isActive = true,
): Assignation {
  return Assignation.recreate(id, {
    beneficientId: BeneficientId.of(beneficientId),
    collectorId: CollectorId.of(collectorId),
    isActive,
  });
}

describe('AssignamentService', () => {
  let service: AssignamentService;
  let collectorRepository: {
    isActive: jest.Mock;
    findByIdWithAssignations: jest.Mock;
    save: jest.Mock;
  };
  let beneficientRepository: { inIds: jest.Mock };
  let assignationRepository: {
    findByCollectorIdWithAssignations: jest.Mock;
    findAssignationsWithElsewhere: jest.Mock;
    findActivesByIds: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    collectorRepository = {
      isActive: jest.fn(),
      findByIdWithAssignations: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    beneficientRepository = { inIds: jest.fn() };
    assignationRepository = {
      findByCollectorIdWithAssignations: jest.fn(),
      findAssignationsWithElsewhere: jest.fn(),
      findActivesByIds: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    service = new AssignamentService(
      collectorRepository as any,
      beneficientRepository as any,
      assignationRepository as any,
    );
  });

  describe('createOrReactivate()', () => {
    it('debería fallar con NOT_FOUND cuando el colector no está activo', async () => {
      collectorRepository.isActive.mockResolvedValue(false);

      const result = await service.createOrReactivate(COLLECTOR_ID, [BID1]);

      expect(result.isSuccess).toBe(false);
      expect(result.error.type).toBe(ErrorType.NOT_FOUND);
      expect(result.error.entity).toBe(Collector.name);
    });

    it('debería fallar con NOT_FOUND cuando algún beneficiario no existe', async () => {
      collectorRepository.isActive.mockResolvedValue(true);
      beneficientRepository.inIds.mockResolvedValue([{}]);

      const result = await service.createOrReactivate(COLLECTOR_ID, [
        BID1,
        BID2,
      ]);

      expect(result.isSuccess).toBe(false);
      expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    });

    it('debería retornar ok con cero asignados cuando todos están activos en otro colector', async () => {
      collectorRepository.isActive.mockResolvedValue(true);
      beneficientRepository.inIds.mockResolvedValue([{}, {}]);
      collectorRepository.findByIdWithAssignations.mockResolvedValue(
        makeCollector(),
      );
      assignationRepository.findByCollectorIdWithAssignations.mockResolvedValue(
        [],
      );
      assignationRepository.findAssignationsWithElsewhere.mockResolvedValue([
        makeAssignation(AID1, BID1, OTHER_COLLECTOR_ID),
        makeAssignation(AID2, BID2, OTHER_COLLECTOR_ID),
      ]);

      const result = await service.createOrReactivate(COLLECTOR_ID, [
        BID1,
        BID2,
      ]);

      expect(result.isSuccess).toBe(true);
      expect(result.value.report.addedCount).toBe(0);
      expect(result.value.report.alreadyAssignedCount).toBe(2);
      expect(result.value.activatedBeneficientIds).toHaveLength(0);
    });

    it('debería crear nuevas asignaciones en el caso exitoso', async () => {
      collectorRepository.isActive.mockResolvedValue(true);
      beneficientRepository.inIds.mockResolvedValue([{}, {}]);
      collectorRepository.findByIdWithAssignations.mockResolvedValue(
        makeCollector(),
      );
      assignationRepository.findByCollectorIdWithAssignations.mockResolvedValue(
        [],
      );
      assignationRepository.findAssignationsWithElsewhere.mockResolvedValue([]);

      const result = await service.createOrReactivate(COLLECTOR_ID, [
        BID1,
        BID2,
      ]);

      expect(result.isSuccess).toBe(true);
      expect(result.value.report.addedCount).toBe(2);
      expect(result.value.report.addedIds.created).toHaveLength(2);
      expect(result.value.activatedBeneficientIds).toEqual(
        expect.arrayContaining([BID1, BID2]),
      );
      expect(assignationRepository.save).toHaveBeenCalledTimes(1);
      expect(collectorRepository.save).toHaveBeenCalledTimes(1);
    });

    it('debería reactivar asignaciones inactivas previas del mismo colector', async () => {
      const inactiveAssignation = makeAssignation(
        AID1,
        BID1,
        COLLECTOR_ID,
        false,
      );
      collectorRepository.isActive.mockResolvedValue(true);
      beneficientRepository.inIds.mockResolvedValue([{}]);
      collectorRepository.findByIdWithAssignations.mockResolvedValue(
        makeCollector(),
      );
      assignationRepository.findByCollectorIdWithAssignations.mockResolvedValue(
        [inactiveAssignation],
      );
      assignationRepository.findAssignationsWithElsewhere.mockResolvedValue([]);

      const result = await service.createOrReactivate(COLLECTOR_ID, [BID1]);

      expect(result.isSuccess).toBe(true);
      expect(result.value.report.addedIds.reactivated).toHaveLength(1);
      expect(result.value.activatedBeneficientIds).toContain(BID1);
      expect(inactiveAssignation.isActive).toBe(true);
    });

    it('debería omitir beneficiarios ya activos en este colector y reportarlos', async () => {
      const activeAssignation = makeAssignation(AID1, BID1, COLLECTOR_ID, true);
      collectorRepository.isActive.mockResolvedValue(true);
      beneficientRepository.inIds.mockResolvedValue([{}]);
      collectorRepository.findByIdWithAssignations.mockResolvedValue(
        makeCollector([AID1]),
      );
      assignationRepository.findByCollectorIdWithAssignations.mockResolvedValue(
        [activeAssignation],
      );
      assignationRepository.findAssignationsWithElsewhere.mockResolvedValue([]);

      const result = await service.createOrReactivate(COLLECTOR_ID, [BID1]);

      expect(result.isSuccess).toBe(true);
      expect(result.value.report.addedCount).toBe(0);
      expect(
        result.value.report.ignoredIds.some(
          (i) => i.reason === 'Already assigned to this collector',
        ),
      ).toBe(true);
    });

    it('debería omitir la validación del colector cuando validateCollector=false', async () => {
      beneficientRepository.inIds.mockResolvedValue([{}]);
      collectorRepository.findByIdWithAssignations.mockResolvedValue(
        makeCollector(),
      );
      assignationRepository.findByCollectorIdWithAssignations.mockResolvedValue(
        [],
      );
      assignationRepository.findAssignationsWithElsewhere.mockResolvedValue([]);

      await service.createOrReactivate(COLLECTOR_ID, [BID1], {
        validateCollector: false,
      });

      expect(collectorRepository.isActive).not.toHaveBeenCalled();
    });
  });

  describe('deactivate()', () => {
    it('debería fallar con NOT_FOUND cuando no hay asignaciones activas', async () => {
      assignationRepository.findActivesByIds.mockResolvedValue([]);

      const result = await service.deactivate([
        { assignationId: AID1, reason: 'Motivo' },
      ]);

      expect(result.isSuccess).toBe(false);
      expect(result.error.type).toBe(ErrorType.NOT_FOUND);
    });

    it('debería desactivar las asignaciones encontradas y persistirlas', async () => {
      const assignation = makeAssignation(AID1, BID1, COLLECTOR_ID, true);
      assignationRepository.findActivesByIds.mockResolvedValue([assignation]);

      const result = await service.deactivate([
        { assignationId: AID1, reason: 'Traslado' },
      ]);

      expect(result.isSuccess).toBe(true);
      expect(assignation.isActive).toBe(false);
      expect(assignation.reasonDeactivate).toBe('Traslado');
      expect(assignationRepository.save).toHaveBeenCalledWith([assignation]);
    });

    it('debería desactivar múltiples asignaciones con sus razones correspondientes', async () => {
      const a1 = makeAssignation(AID1, BID1, COLLECTOR_ID, true);
      const a2 = makeAssignation(AID2, BID2, COLLECTOR_ID, true);
      assignationRepository.findActivesByIds.mockResolvedValue([a1, a2]);

      await service.deactivate([
        { assignationId: AID1, reason: 'Razón A' },
        { assignationId: AID2, reason: 'Razón B' },
      ]);

      expect(a1.reasonDeactivate).toBe('Razón A');
      expect(a2.reasonDeactivate).toBe('Razón B');
    });
  });
});
