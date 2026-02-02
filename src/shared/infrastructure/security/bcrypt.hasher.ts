import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '@/auth/domain/services/password.hasher.service';

export class BcryptHasher implements IPasswordHasher {
  private readonly SALT_ROUNDS = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
