import { createHash, timingSafeEqual } from 'node:crypto';
import { ITokenHasher } from '@/auth/domain/services/token-hasher.service';

export class TokenHasher implements ITokenHasher {
  async hash(token: string): Promise<string> {
    const digest = createHash('sha256');
    digest.update(token, 'utf8');
    return digest.digest('base64');
  }

  async safeCompare(hash: string, token: string): Promise<boolean> {
    const bufferA = Buffer.from(hash);
    const bufferB = Buffer.from(token);

    if (bufferA.length !== bufferB.length) return false;
    return timingSafeEqual(bufferA, bufferB);
  }
}
