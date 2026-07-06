import {
  AssignationMapper,
  IAssignationPersistence,
} from './assignation.mapper';
import { Assignation } from '@/community/domain/aggregate/assignation.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';

const ASSIGNATION_ID = '01907c2a-0000-7000-8000-000000000001';
const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000002';
const BENEFICIENT_ID = '01907c2a-0000-7000-8000-000000000003';

function makeDomainAssignation(
  isActive = true,
  reason: string | null = null,
): Assignation {
  return Assignation.recreate(ASSIGNATION_ID, {
    collectorId: CollectorId.of(COLLECTOR_ID),
    beneficientId: BeneficientId.of(BENEFICIENT_ID),
    reasonDeactivate: reason,
    isActive,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-06-01'),
  });
}

const validRaw: IAssignationPersistence = {
  id: ASSIGNATION_ID,
  collectorId: COLLECTOR_ID,
  beneficientId: BENEFICIENT_ID,
  reasonDeactivated: null,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-06-01'),
};

describe('AssignationMapper', () => {
  describe('toPersistence()', () => {
    it('debería mapear la asignación activa al objeto de persistencia', () => {
      const raw = AssignationMapper.toPersistence(makeDomainAssignation(true));

      expect(raw.id).toBe(ASSIGNATION_ID);
      expect(raw.collectorId).toBe(COLLECTOR_ID);
      expect(raw.beneficientId).toBe(BENEFICIENT_ID);
      expect(raw.isActive).toBe(true);
      expect(raw.reasonDeactivated).toBeNull();
    });

    it('debería mapear la asignación inactiva con su razón', () => {
      const raw = AssignationMapper.toPersistence(
        makeDomainAssignation(false, 'Traslado'),
      );

      expect(raw.isActive).toBe(false);
      expect(raw.reasonDeactivated).toBe('Traslado');
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir la asignación activa desde persistencia', () => {
      const assignation = AssignationMapper.toDomain(validRaw);

      expect(assignation._id.unpack()).toBe(ASSIGNATION_ID);
      expect(assignation.collectorId.unpack()).toBe(COLLECTOR_ID);
      expect(assignation.beneficientId.unpack()).toBe(BENEFICIENT_ID);
      expect(assignation.isActive).toBe(true);
    });

    it('debería reconstruir una asignación inactiva con su razón', () => {
      const raw: IAssignationPersistence = {
        ...validRaw,
        isActive: false,
        reasonDeactivated: 'Baja',
      };
      const assignation = AssignationMapper.toDomain(raw);

      expect(assignation.isActive).toBe(false);
      expect(assignation.reasonDeactivate).toBe('Baja');
    });
  });
});
