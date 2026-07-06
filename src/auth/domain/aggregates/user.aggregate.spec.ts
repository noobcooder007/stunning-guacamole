import { User, UserId } from './user.aggregate';
import { RoleId } from './role.aggregate';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const ROLE_ID = '01907c2a-0000-7000-8000-000000000002';

function makeUser(isActive = true): User {
  return User.recreate(USER_ID, {
    username: 'testuser',
    password: 'hashed-password',
    roleId: RoleId.of(ROLE_ID),
    isActive,
    createdAt: new Date('2026-01-01'),
    lastLogin: new Date('2026-05-01'),
  });
}

describe('User', () => {
  describe('create()', () => {
    it('debería crear un usuario con isActive=true y createdAt asignado', () => {
      const user = User.create({
        username: 'newuser',
        password: 'hashed',
        roleId: RoleId.of(ROLE_ID),
        lastLogin: null,
        isActive: false,
        createdAt: new Date(),
      });

      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeDefined();
      expect(user.username).toBe('newuser');
    });

    it('debería generar un UserId único', () => {
      const a = User.create({
        username: 'a',
        password: 'h',
        roleId: RoleId.of(ROLE_ID),
        isActive: false,
        createdAt: new Date(),
        lastLogin: null,
      });
      const b = User.create({
        username: 'b',
        password: 'h',
        roleId: RoleId.of(ROLE_ID),
        isActive: false,
        createdAt: new Date(),
        lastLogin: null,
      });
      expect(a._id.unpack()).not.toBe(b._id.unpack());
    });
  });

  describe('validatePassword()', () => {
    it('debería retornar true cuando la contraseña es correcta y el usuario está activo', async () => {
      const hasher = { compare: jest.fn().mockResolvedValue(true) };
      expect(
        await makeUser(true).validatePassword(hasher as any, 'password'),
      ).toBe(true);
    });

    it('debería retornar false cuando la contraseña es incorrecta', async () => {
      const hasher = { compare: jest.fn().mockResolvedValue(false) };
      expect(
        await makeUser(true).validatePassword(hasher as any, 'wrong'),
      ).toBe(false);
    });

    it('debería retornar false cuando el usuario está inactivo aunque la contraseña sea correcta', async () => {
      const hasher = { compare: jest.fn().mockResolvedValue(true) };
      expect(
        await makeUser(false).validatePassword(hasher as any, 'password'),
      ).toBe(false);
    });
  });

  describe('updateLastLogin()', () => {
    it('debería actualizar lastLogin a la fecha actual', () => {
      const user = makeUser();
      const before = new Date();
      user.updateLastLogin();
      expect(user.lastLogin.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('deactivate()', () => {
    it('debería marcar al usuario como inactivo', () => {
      const user = makeUser(true);
      user.deactivate();
      expect(user.isActive).toBe(false);
    });
  });

  describe('UserId', () => {
    it('debería crear un nuevo UUID con create()', () => {
      const id = UserId.create();
      expect(id.unpack()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });
});
