import { User } from '@/auth/domain/aggregates/user.aggregate';

export abstract class IUserRepository {
  abstract count(): Promise<number>;
  abstract findAll(): Promise<User[]>;
  abstract findOneById(id: string): Promise<User | null>;
  abstract findOneByUsername(username: string): Promise<User | null>;
  abstract save(user: User): Promise<string>;
}
