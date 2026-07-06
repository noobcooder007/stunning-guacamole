import { UserMapper, IUserPersistence } from './user.mapper';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { RoleId } from '@/auth/domain/aggregates/role.aggregate';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const ROLE_ID = '01907c2a-0000-7000-8000-000000000002';

function makeDomainUser(): User {
  return User.recreate(USER_ID, {
    username: 'testuser',
    password: 'hashed-password',
    roleId: RoleId.of(ROLE_ID),
    gender: 'MALE',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    lastLogin: new Date('2026-06-01'),
  });
}

const validRaw: IUserPersistence = {
  id: USER_ID,
  username: 'testuser',
  password: 'hashed-password',
  roleId: ROLE_ID,
  createdAt: new Date('2026-01-01'),
  isActive: true,
  lastLogin: new Date('2026-06-01'),
  gender: 'MALE',
};

describe('UserMapper', () => {
  describe('toPersistance()', () => {
    it('debería mapear el usuario al objeto de persistencia', () => {
      const raw = UserMapper.toPersistance(makeDomainUser());
      expect(raw.id).toBe(USER_ID);
      expect(raw.username).toBe('testuser');
      expect(raw.roleId).toBe(ROLE_ID);
      expect(raw.isActive).toBe(true);
      expect(raw.gender).toBe('MALE');
    });
  });

  describe('fromModelToDomain()', () => {
    it('debería reconstruir el usuario desde persistencia', () => {
      const user = UserMapper.fromModelToDomain(validRaw);
      expect(user._id.unpack()).toBe(USER_ID);
      expect(user.username).toBe('testuser');
      expect(user.role.unpack()).toBe(ROLE_ID);
      expect(user.isActive).toBe(true);
      expect(user.gender).toBe('MALE');
    });

    it('debería funcionar sin gender opcional', () => {
      const { gender, ...rawNoGender } = validRaw;
      const user = UserMapper.fromModelToDomain(
        rawNoGender as IUserPersistence,
      );
      expect(user.gender).toBeUndefined();
    });
  });
});
