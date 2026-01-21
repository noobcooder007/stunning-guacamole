import { User } from '@/auth/domain/aggregates/user.aggregate';
import { IRolePersistence } from '@/auth/infrastructure/persistence/mappers/role.mapper';

export interface IUserPersistence {
  id: string;
  username: string;
  password: string;
  roleId: string;
  role?: IRolePersistence;
  // participant?: IParticipantPersistence;
  createdAt: Date;
  isActive: boolean;
  lastLogin: Date;
}

export class UserMapper {
  public static toPersistance(user: User): IUserPersistence {
    return {
      id: user._id,
      username: user.username,
      password: user.password,
      roleId: user.role,
      createdAt: user.createdAt,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };
  }

  public static fromModelToDomain(raw: IUserPersistence): User {
    return User.recreate(raw.id, {
      username: raw.username,
      password: raw.password,
      roleId: raw.roleId,
      // participant: ParticipantMapper.toDomain(raw.participant),
      createdAt: raw.createdAt,
      isActive: raw.isActive,
    });
  }
}
