import {
  Permission,
  PermissionId,
} from '@/auth/domain/entities/permission.entity';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

const VALID_UUID = '00000000-0000-0000-0000-000000000001';

describe('PermissionId', () => {
  describe('create()', () => {
    it('genera un UUID v7 válido', () => {
      const id = PermissionId.create();
      expect(id.unpack()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('dos llamadas producen IDs distintos', () => {
      expect(PermissionId.create().unpack()).not.toBe(
        PermissionId.create().unpack(),
      );
    });
  });

  describe('of()', () => {
    it('acepta un UUID válido', () => {
      const id = PermissionId.of(VALID_UUID);
      expect(id.unpack()).toBe(VALID_UUID);
    });

    it('lanza InvalidAttributeException con un string no-UUID', () => {
      expect(() => PermissionId.of('no-es-uuid')).toThrow(
        InvalidAttributeException,
      );
    });
  });

  describe('toString()', () => {
    it('devuelve el mismo valor que unpack()', () => {
      const id = PermissionId.of(VALID_UUID);
      expect(id.toString()).toBe(id.unpack());
    });
  });
});

describe('Permission', () => {
  const baseProps = {
    name: 'view:church',
    description: 'Ver iglesia',
  };

  describe('create()', () => {
    it('crea un permiso con isActive=true y createdAt asignado', () => {
      const before = new Date();
      const permission = Permission.create(baseProps);
      const after = new Date();

      expect(permission.name).toBe('view:church');
      expect(permission.description).toBe('Ver iglesia');
      expect(permission.isActive).toBe(true);
      expect(permission.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(permission.createdAt.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it('asigna un _id UUID válido', () => {
      const permission = Permission.create(baseProps);
      expect(permission._id.unpack()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('lanza si name es null', () => {
      expect(() =>
        Permission.create({ name: null as any, description: 'desc' }),
      ).toThrow(InvalidAttributeException);
    });

    it('lanza si description es null', () => {
      expect(() =>
        Permission.create({ name: 'view:church', description: null as any }),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('recreate()', () => {
    it('reconstruye desde persistencia con los mismos valores', () => {
      const createdAt = new Date('2024-01-01');
      const permission = Permission.recreate(VALID_UUID, {
        ...baseProps,
        isActive: false,
        createdAt,
      });

      expect(permission._id.unpack()).toBe(VALID_UUID);
      expect(permission.isActive).toBe(false);
      expect(permission.createdAt).toBe(createdAt);
    });

    it('lanza con UUID inválido', () => {
      expect(() => Permission.recreate('not-a-uuid', baseProps)).toThrow(
        InvalidAttributeException,
      );
    });
  });

  describe('update()', () => {
    it('actualiza la descripción', () => {
      const permission = Permission.create(baseProps);
      permission.update('Nueva descripción');
      expect(permission.description).toBe('Nueva descripción');
    });

    it('no modifica otros campos', () => {
      const permission = Permission.create(baseProps);
      const idBefore = permission._id.unpack();
      permission.update('Otra descripción');
      expect(permission.name).toBe('view:church');
      expect(permission._id.unpack()).toBe(idBefore);
    });
  });

  describe('deactivate()', () => {
    it('cambia isActive a false', () => {
      const permission = Permission.create(baseProps);
      expect(permission.isActive).toBe(true);
      permission.deactivate();
      expect(permission.isActive).toBe(false);
    });

    it('es idempotente si ya está inactivo', () => {
      const permission = Permission.recreate(VALID_UUID, {
        ...baseProps,
        isActive: false,
        createdAt: new Date(),
      });
      permission.deactivate();
      expect(permission.isActive).toBe(false);
    });
  });
});
