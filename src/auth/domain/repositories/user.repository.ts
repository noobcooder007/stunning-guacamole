import { User } from '../aggregates/user.aggregate';

export abstract class UserRepository {
  abstract count(): Promise<number>;
  abstract findOneById(id: string): Promise<User | null>;
  abstract findOneByUsername(username: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
}
