import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { UserModel } from '../models/user.model';
import { RoleMapper } from './role.mapper';

export class UserMapper {
  public static toPersistance(user: User): any {
    return {
      id: user._id,
      username: user.username,
      password: user.password,
      role: user.role._id,
      createdAt: user.createdAt,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };
  }

  public static fromCommandToDomain(raw: CreateUserCommand): User {
    return User.create({
      username: raw.username,
      password: raw.password,
    });
  }

  public static fromModelToDomain(raw: UserModel): User {
    return User.recreate(raw.id, {
      username: raw.username,
      password: raw.password,
      role: RoleMapper.toDomain(raw.role),
      createdAt: raw.createdAt,
      isActive: raw.isActive,
    });
  }
}
