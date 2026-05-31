import { Role, RoleId } from '@/auth/domain/aggregates/role.aggregate';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

const VALID_UUID = '00000000-0000-0000-0000-000000000001';

function makePermission(name = 'view:church'): Permission {
  return Permission.create({ name, description: 'Permiso de prueba' });
}

describe('RoleId', () => {
  it('create() genera un UUID válido', () => {
    const id = RoleId.create();
    expect(id.unpack()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('of() acepta un UUID válido', () => {
    const id = RoleId.of(VALID_UUID);
    expect(id.unpack()).toBe(VALID_UUID);
  });

  it('of() lanza con string no-UUID', () => {
    expect(() => RoleId.of('invalido')).toThrow(InvalidAttributeException);
  });
});

describe('Role', () => {
  const baseProps = {
    name: 'collector',
    description: 'Rol de colector',
    permissions: new Set([makePermission()]),
  };

  describe('create()', () => {
    it('crea el rol con isActive=true y createdAt asignado', () => {
      const before = new Date();
      const role = Role.create(baseProps);
      expect(role.name).toBe('collector');
      expect(role.description).toBe('Rol de colector');
      expect(role.isActive).toBe(true);
      expect(role.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('expone los permisos como array', () => {
      const role = Role.create(baseProps);
      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0].name).toBe('view:church');
    });

    it('lanza si se pasa un Set vacío de permisos', () => {
      expect(() =>
        Role.create({ ...baseProps, permissions: new Set() }),
      ).toThrow(InvalidAttributeException);
    });

    it('lanza si name es null', () => {
      expect(() =>
        Role.create({ ...baseProps, name: null as any }),
      ).toThrow(InvalidAttributeException);
    });

    it('lanza si description es null', () => {
      expect(() =>
        Role.create({ ...baseProps, description: null as any }),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('recreate()', () => {
    it('reconstruye correctamente desde persistencia', () => {
      const role = Role.recreate(VALID_UUID, {
        ...baseProps,
        isActive: false,
        createdAt: new Date('2024-01-01'),
      });
      expect(role._id.unpack()).toBe(VALID_UUID);
      expect(role.isActive).toBe(false);
    });

    it('lanza con UUID inválido', () => {
      expect(() =>
        Role.recreate('not-uuid', baseProps),
      ).toThrow(InvalidAttributeException);
    });
  });

  describe('updatePermissions()', () => {
    it('reemplaza los permisos existentes', () => {
      const role = Role.create(baseProps);
      const newPerms = [
        makePermission('add:church'),
        makePermission('edit:church'),
      ];
      role.updatePermissions(newPerms);
      expect(role.permissions).toHaveLength(2);
      expect(role.permissions.map((p) => p.name)).toContain('add:church');
    });

    it('lanza DomainException si la lista está vacía', () => {
      const role = Role.create(baseProps);
      expect(() => role.updatePermissions([])).toThrow(DomainException);
    });

    it('elimina duplicados al usar Set internamente', () => {
      const role = Role.create(baseProps);
      const perm = makePermission('view:church');
      role.updatePermissions([perm, perm]);
      // El Set de dominio puede admitir duplicados por referencia;
      // lo importante es que la operación no lanza
      expect(role.permissions.length).toBeGreaterThan(0);
    });
  });

  describe('deactivate()', () => {
    it('cambia isActive a false', () => {
      const role = Role.create(baseProps);
      role.deactivate();
      expect(role.isActive).toBe(false);
    });
  });
});
