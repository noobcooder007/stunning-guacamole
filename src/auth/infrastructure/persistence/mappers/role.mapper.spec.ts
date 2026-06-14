import { RoleMapper, IRolePersistence } from './role.mapper';
import { PermissionMapper } from './permission.mapper';
import { Role } from '@/auth/domain/aggregates/role.aggregate';
import { Permission } from '@/auth/domain/entities/permission.entity';

const ROLE_ID = '01907c2a-0000-7000-8000-000000000001';
const PERM_ID = '01907c2a-0000-7000-8000-000000000010';

function makePermission(): Permission {
  return Permission.recreate(PERM_ID, {
    name: 'view:collectors',
    description: 'Ver colectores',
    createdAt: new Date('2026-01-01'),
    isActive: true,
  });
}

function makeDomainRole(): Role {
  return Role.recreate(ROLE_ID, {
    name: 'collector',
    description: 'Rol de colector',
    permissions: new Set([makePermission()]),
    isActive: true,
    createdAt: new Date('2026-01-01'),
  });
}

const validRaw: IRolePersistence = {
  id: ROLE_ID,
  name: 'collector',
  description: 'Rol de colector',
  permissions: [
    { id: PERM_ID, name: 'view:collectors', description: 'Ver colectores', createdAt: new Date('2026-01-01'), isActive: true },
  ],
  createdAt: new Date('2026-01-01'),
  isActive: true,
};

describe('PermissionMapper', () => {
  describe('toPersistance()', () => {
    it('debería mapear un Permission a persistencia', () => {
      const raw = PermissionMapper.toPersistance(makePermission());
      expect((raw as any).id).toBe(PERM_ID);
      expect((raw as any).name).toBe('view:collectors');
    });

    it('debería mapear un array de Permissions a persistencia', () => {
      const raw = PermissionMapper.toPersistance([makePermission()]) as any[];
      expect(raw).toHaveLength(1);
      expect(raw[0].id).toBe(PERM_ID);
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir un Permission desde persistencia', () => {
      const perm = PermissionMapper.toDomain(validRaw.permissions[0]);
      expect(perm._id.unpack()).toBe(PERM_ID);
      expect(perm.name).toBe('view:collectors');
      expect(perm.isActive).toBe(true);
    });
  });
});

describe('RoleMapper', () => {
  describe('toPersistance()', () => {
    it('debería mapear el role al objeto de persistencia', () => {
      const raw = RoleMapper.toPersistance(makeDomainRole());
      expect(raw.id).toBe(ROLE_ID);
      expect(raw.name).toBe('collector');
      expect(raw.isActive).toBe(true);
      expect(raw.permissions).toHaveLength(1);
    });
  });

  describe('toDomain()', () => {
    it('debería reconstruir el role desde persistencia', () => {
      const role = RoleMapper.toDomain(validRaw);
      expect(role._id.unpack()).toBe(ROLE_ID);
      expect(role.name).toBe('collector');
      expect(role.permissions).toHaveLength(1);
      expect(role.isActive).toBe(true);
    });

    it('debería reconstruir los permisos anidados', () => {
      const role = RoleMapper.toDomain(validRaw);
      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0].name).toBe('view:collectors');
    });
  });
});
