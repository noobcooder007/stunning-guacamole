import { Collector } from './collector.aggregate';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import { AssignationId } from '@/community/domain/aggregate/assignation.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import {
  UpdateCollectorContactCommand,
  UpdateCollectorPaymentCommand,
  UpdateCollectorNotesCommand,
} from '@/community/application/command/update-collector.command';

const COLLECTOR_ID = '01907c2a-0000-7000-8000-000000000001';
const USER_ID = '01907c2a-0000-7000-8000-000000000002';
const PROFILE_ID = '01907c2a-0000-7000-8000-000000000003';

function makeProfile() {
  return Profile.recreate(PROFILE_ID, {
    firstname: 'Juan',
    firstLastname: 'García',
    secondLastname: null,
    address: Address.of({
      street: 'Calle Falsa',
      numeration: Numeration.of({ noExt: '123', noInt: null }),
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'CDMX',
      zipCode: ZipCode.of('06600'),
    }),
    addressHash: 'hash-addr',
    phoneNumber: PhoneNumber.of('5512345678'),
    phoneNumberHash: 'hash-phone',
    createdAt: new Date('2026-01-01'),
  });
}

function makeCollector(
  overrides: {
    isActive?: boolean;
    assignations?: Set<AssignationId>;
    telephoneNumber?: PhoneNumber | null;
    telephoneNumberHash?: string | null;
  } = {},
) {
  return Collector.recreate(COLLECTOR_ID, {
    userId: UserId.of(USER_ID),
    profileId: makeProfile()._id,
    profile: makeProfile(),
    nss: NSS.of('12345678901'),
    nssHash: 'hash-nss',
    telephoneNumber: overrides.telephoneNumber ?? null,
    telephoneNumberHash: overrides.telephoneNumberHash ?? null,
    paymentData: PaymentData.of({
      commissionPercent: 10,
      bank: 'BBVA',
      reference: 'REF001',
      nomina: 1000,
      transportAllowance: 200,
    }),
    assignations: overrides.assignations ?? new Set(),
    notes: 'Sin notas',
    createdAt: new Date('2026-01-01'),
    isActive: overrides.isActive ?? true,
    profilePath: 'profile.png',
    collectorNumber: 1,
  });
}

describe('Collector', () => {
  describe('update()', () => {
    it('debería actualizar teléfono fijo con UpdateCollectorContactCommand', () => {
      const collector = makeCollector();
      const cmd = new UpdateCollectorContactCommand(
        COLLECTOR_ID,
        undefined,
        '5551234567',
      );
      cmd.telephoneNumberHash = 'hash-tel';

      collector.update(cmd);

      expect(collector.telephoneNumber.unpack()).toBe('5551234567');
      expect(collector.telephoneNumberHash).toBe('hash-tel');
    });

    it('debería poner teléfono fijo a null cuando se pasa null', () => {
      const collectorWithTel = makeCollector({
        telephoneNumber: PhoneNumber.of('5551234567'),
        telephoneNumberHash: 'hash-tel',
      });
      const cmd = new UpdateCollectorContactCommand(
        COLLECTOR_ID,
        undefined,
        null,
      );
      cmd.telephoneNumberHash = null;

      collectorWithTel.update(cmd);

      expect(collectorWithTel.telephoneNumber).toBeNull();
    });

    it('no debería modificar el teléfono fijo cuando no viene en el comando', () => {
      const collector = makeCollector({
        telephoneNumber: PhoneNumber.of('5551234567'),
        telephoneNumberHash: 'hash-tel',
      });
      const cmd = new UpdateCollectorContactCommand(COLLECTOR_ID, '5598765432');

      collector.update(cmd);

      expect(collector.telephoneNumber.unpack()).toBe('5551234567');
    });

    it('debería actualizar datos de pago con UpdateCollectorPaymentCommand', () => {
      const collector = makeCollector();
      const cmd = new UpdateCollectorPaymentCommand(
        COLLECTOR_ID,
        15,
        1200,
        300,
        'Banamex',
        'REF999',
      );

      collector.update(cmd);

      expect(collector.paymentData.commissionPercent).toBe(15);
      expect(collector.paymentData.bank).toBe('Banamex');
      expect(collector.paymentData.nomina).toBe(1200);
    });

    it('debería actualizar notas con UpdateCollectorNotesCommand', () => {
      const collector = makeCollector();
      const cmd = new UpdateCollectorNotesCommand(
        COLLECTOR_ID,
        'Nuevas notas importantes',
      );

      collector.update(cmd);

      expect(collector.notes).toBe('Nuevas notas importantes');
    });
  });

  describe('addAssignation()', () => {
    it('debería retornar undefined si el arreglo está vacío', () => {
      const collector = makeCollector();

      const result = collector.addAssignation([]);

      expect(result).toBeUndefined();
    });

    it('debería agregar una asignación nueva al set', () => {
      const collector = makeCollector();
      const assignationId = AssignationId.of(
        '01907c2a-0000-7000-8000-000000000010',
      );

      collector.addAssignation([assignationId]);

      expect(collector.assignations.size).toBe(1);
    });

    it('debería clasificar como alreadyAssigned cuando ya existe', () => {
      const assignationId = AssignationId.of(
        '01907c2a-0000-7000-8000-000000000010',
      );
      const collector = makeCollector({
        assignations: new Set([assignationId]),
      });

      const result = collector.addAssignation([assignationId]);

      expect(result.get('alreadyAssigned')).toHaveLength(1);
      expect(result.get('notAssigned')).toHaveLength(0);
    });

    it('debería clasificar como notAssigned cuando el set ya tiene 100 asignaciones', () => {
      const existingAssignations = new Set(
        Array.from({ length: 100 }, (_, i) => {
          const hex = String(i).padStart(12, '0');
          return AssignationId.of(`01907c2a-0000-7000-8000-${hex}`);
        }),
      );
      const collector = makeCollector({ assignations: existingAssignations });
      const extra = AssignationId.of('01907c2a-0000-7000-9000-000000000001');

      const result = collector.addAssignation([extra]);

      expect(result.get('notAssigned')).toHaveLength(1);
      expect(collector.assignations.size).toBe(100);
    });
  });

  describe('deactivate()', () => {
    it('debería emitir evento y marcar como inactivo', () => {
      const collector = makeCollector();

      collector.deactivate();

      expect(collector.isActive).toBe(false);
    });

    it('debería ser no-op si ya está inactivo', () => {
      const collector = makeCollector({ isActive: false });
      const applyMock = jest.spyOn(collector as any, 'apply');

      collector.deactivate();

      expect(applyMock).not.toHaveBeenCalled();
      expect(collector.isActive).toBe(false);
    });
  });

  describe('reactivate()', () => {
    it('debería marcar como activo cuando está inactivo', () => {
      const collector = makeCollector({ isActive: false });

      collector.reactivate();

      expect(collector.isActive).toBe(true);
    });

    it('debería ser no-op si ya está activo', () => {
      const collector = makeCollector({ isActive: true });

      collector.reactivate();

      expect(collector.isActive).toBe(true);
    });
  });
});
