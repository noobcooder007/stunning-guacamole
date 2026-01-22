import { IRolePersistence } from '@/auth/infrastructure/persistence/mappers/role.mapper';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { RoleId } from '@/auth/domain/aggregates/role.aggregate';

export interface IUserPersistence {
  id: string;
  username: string;
  password: string;
  roleId: string;
  role?: IRolePersistence;
  createdAt: Date;
  isActive: boolean;
  lastLogin: Date;
}

export class UserMapper {
  public static toPersistance(user: User): IUserPersistence {
    return {
      id: user._id.unpack(),
      username: user.username,
      password: user.password,
      roleId: user.role.unpack(),
      createdAt: user.createdAt,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };
  }

  public static fromModelToDomain(raw: IUserPersistence): User {
    return User.recreate(raw.id, {
      username: raw.username,
      password: raw.password,
      roleId: RoleId.of(raw.roleId),
      createdAt: raw.createdAt,
      isActive: raw.isActive,
    });
  }
}
