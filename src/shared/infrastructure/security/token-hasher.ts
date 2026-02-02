import { createHash, timingSafeEqual } from 'node:crypto';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';

export class TokenHasher implements IDataHasher {
  async hash(token: string, usePepper = false): Promise<string> {
    const digest = createHash('sha256');
    const secret = usePepper ? process.env.PEPPER : '';
    digest.update(`${token}${secret}`, 'utf8');
    return digest.digest('base64');
  }

  async safeCompare(hash: string, token: string): Promise<boolean> {
    const bufferA = Buffer.from(hash);
    const bufferB = Buffer.from(token);

    if (bufferA.length !== bufferB.length) return false;
    return timingSafeEqual(bufferA, bufferB);
  }
}
