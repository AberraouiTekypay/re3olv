import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

type Keyring = { currentKeyId: string; keys: Map<string, Buffer> };

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyring: Keyring | undefined;

  constructor() {
    const rawKeyring = process.env.ENCRYPTION_KEYS_JSON;
    const currentKeyId = process.env.CURRENT_ENCRYPTION_KEY_ID;
    if (!rawKeyring && !currentKeyId) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Production requires ENCRYPTION_KEYS_JSON and CURRENT_ENCRYPTION_KEY_ID');
      }
      return;
    }
    if (!rawKeyring || !currentKeyId) {
      throw new Error('ENCRYPTION_KEYS_JSON and CURRENT_ENCRYPTION_KEY_ID must be configured together');
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawKeyring) as Record<string, unknown>;
    } catch {
      throw new Error('ENCRYPTION_KEYS_JSON must be a JSON object of base64 keys');
    }
    const keys = new Map<string, Buffer>();
    for (const [keyId, encoded] of Object.entries(parsed)) {
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(keyId) || typeof encoded !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
        throw new Error(`Invalid encryption key entry: ${keyId || '(empty id)'}`);
      }
      const key = Buffer.from(encoded, 'base64');
      if (key.length !== 32 || key.toString('base64') !== encoded) {
        throw new Error(`Encryption key ${keyId} must be canonical base64 for exactly 32 bytes`);
      }
      keys.set(keyId, key);
    }
    if (!keys.has(currentKeyId)) throw new Error('CURRENT_ENCRYPTION_KEY_ID must identify a configured key');
    this.keyring = { currentKeyId, keys };
  }

  encrypt(text: string): string {
    if (!text) return text;
    const keyring = this.requireKeyring();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, keyring.keys.get(keyring.currentKeyId)!, iv);
    cipher.setAAD(Buffer.from(`re3olv:v1:${keyring.currentKeyId}`));
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return ['v1', keyring.currentKeyId, iv.toString('base64url'), authTag.toString('base64url'), encrypted.toString('base64url')].join('.');
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;
    const [version, keyId, ivEncoded, tagEncoded, ciphertextEncoded, ...extra] = encryptedText.split('.');
    if (version !== 'v1' || !keyId || !ivEncoded || !tagEncoded || !ciphertextEncoded || extra.length) {
      throw new Error('Unsupported or malformed ciphertext envelope');
    }
    const keyring = this.requireKeyring();
    const key = keyring.keys.get(keyId);
    if (!key) throw new Error(`Encryption key ${keyId} is not configured`);
    const iv = Buffer.from(ivEncoded, 'base64url');
    const authTag = Buffer.from(tagEncoded, 'base64url');
    const ciphertext = Buffer.from(ciphertextEncoded, 'base64url');
    if (iv.length !== 12 || authTag.length !== 16 || !ciphertext.length) throw new Error('Malformed ciphertext envelope');
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAAD(Buffer.from(`re3olv:v1:${keyId}`));
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }

  reencrypt(ciphertext: string): string {
    if (!ciphertext) return ciphertext;
    const plaintext = this.decrypt(ciphertext);
    return this.encrypt(plaintext);
  }

  private requireKeyring(): Keyring {
    if (!this.keyring) throw new Error('Encryption keyring is not configured');
    return this.keyring;
  }
}
