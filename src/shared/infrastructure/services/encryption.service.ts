import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

  static instance: EncryptionService;

  constructor() {
    EncryptionService.instance = this;
  }

  encrypt(text: string): string {
    if (!text) return text;
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(text: string): string {
    if (!text || !text.includes(':')) return text;
    try {
      const [iv, encrypted] = text.split(':');
      const decipher = createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(iv, 'hex'),
      );
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted, 'hex')),
        decipher.final(),
      ]);
      return decrypted.toString();
    } catch {
      return text;
    }
  }
}
