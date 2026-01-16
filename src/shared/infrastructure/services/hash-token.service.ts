import { createHash } from 'node:crypto';

export function hashToken(token: string): string {
  const digest = createHash('sha256');
  digest.update(token, 'utf8');
  return digest.digest('base64');
}
