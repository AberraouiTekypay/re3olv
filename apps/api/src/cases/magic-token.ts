import { createHash } from 'crypto';

export function hashMagicToken(token: string): Buffer {
  return createHash('sha256').update(token).digest();
}
