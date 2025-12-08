import { UserModel } from '@/auth/infrastructure/models/user.model';

export abstract class UserRepository {
  abstract findOneById(id: string): Promise<UserModel>;
  abstract findOneByUsername(username: string): Promise<UserModel | null>;
  abstract create(user: Partial<UserModel>): UserModel;
  abstract save(user: UserModel): Promise<UserModel>;
  abstract updateLastLogin(id: string): void;
}
