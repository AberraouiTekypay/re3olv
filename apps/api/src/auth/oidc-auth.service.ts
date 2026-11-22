import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { createPublicKey, verify as verifySignature } from 'crypto';
import type { AuthenticatedPrincipal } from './roles.guard.js';
import { PrismaService } from '../database/prisma.service.js';

type JwtHeader = { alg?: string; kid?: string };
type JwtClaims = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
};
type OidcDiscovery = { issuer: string; jwks_uri: string };
type Jwks = { keys: Array<Record<string, unknown> & { kid?: string; use?: string }> };

@Injectable()
export class OidcAuthService implements OnModuleInit {
  private discoveryCache?: { expiresAt: number; value: OidcDiscovery };
  private jwksCache?: { expiresAt: number; value: Jwks };
  private lastJwksRefreshAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    if (process.env.NODE_ENV !== 'production') return;
    const issuer = process.env.OIDC_ISSUER;
    if (!issuer || !process.env.OIDC_AUDIENCE) {
      throw new Error('OIDC_ISSUER and OIDC_AUDIENCE must be configured in production');
    }
    if (new URL(issuer).protocol !== 'https:') {
      throw new Error('OIDC_ISSUER must use HTTPS in production');
    }
  }

  async authenticate(token: string): Promise<AuthenticatedPrincipal> {
    try {
      const issuer = process.env.OIDC_ISSUER;
      const audience = process.env.OIDC_AUDIENCE;
      if (!issuer || !audience) throw new Error('OIDC configuration is missing');

      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Malformed token');
      const header = this.decodePart<JwtHeader>(parts[0]);
      const claims = this.decodePart<JwtClaims>(parts[1]);
      if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported token signing key');

      const discovery = await this.getDiscovery(issuer);
      if (discovery.issuer !== issuer || claims.iss !== issuer) {
        throw new Error('Token issuer mismatch');
      }
      const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
      if (!audiences.includes(audience)) throw new Error('Token audience mismatch');

      const now = Math.floor(Date.now() / 1000);
      const subject = claims.sub;
      if (!subject || typeof claims.exp !== 'number' || claims.exp <= now) {
        throw new Error('Token is expired or missing required claims');
      }
      if (typeof claims.nbf === 'number' && claims.nbf > now + 60) {
        throw new Error('Token is not yet valid');
      }
      if (typeof claims.iat === 'number' && claims.iat > now + 60) {
        throw new Error('Token issue time is invalid');
      }

      let jwks = await this.getJwks(discovery.jwks_uri);
      const isSigningKey = (candidate: Jwks['keys'][number]) =>
        candidate.kid === header.kid &&
        (candidate.use === undefined || candidate.use === 'sig') &&
        (!Array.isArray(candidate.key_ops) || candidate.key_ops.includes('verify'));
      let key = jwks.keys.find(isSigningKey);
      if (!key) {
        jwks = await this.getJwks(discovery.jwks_uri, true);
        key = jwks.keys.find(isSigningKey);
      }
      if (!key) throw new Error('Signing key was not found');
      if (key.kty !== 'RSA' || (key.alg && key.alg !== 'RS256')) {
        throw new Error('Signing key algorithm mismatch');
      }

      const publicKey = createPublicKey({ key: key as any, format: 'jwk' });
      const signature = Buffer.from(parts[2], 'base64url');
      const signedContent = Buffer.from(`${parts[0]}.${parts[1]}`);
      if (!verifySignature('RSA-SHA256', signedContent, publicKey, signature)) {
        throw new Error('Token signature is invalid');
      }

      const user = await this.prisma.user.findUnique({
        where: { oidcSubject: subject },
        select: { id: true, role: true, organizationId: true },
      });
      if (!user || !['AGENT', 'MANAGER', 'PLATFORM_ADMIN'].includes(user.role)) {
        throw new Error('User is not provisioned for institutional access');
      }

      return {
        sub: user.id,
        orgId: user.organizationId,
        role: user.role as 'AGENT' | 'MANAGER' | 'PLATFORM_ADMIN',
      };
    } catch {
      throw new UnauthorizedException('Invalid or unprovisioned OIDC access token');
    }
  }

  private decodePart<T>(value: string): T {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
  }

  private async getDiscovery(issuer: string): Promise<OidcDiscovery> {
    if (this.discoveryCache && this.discoveryCache.expiresAt > Date.now()) {
      return this.discoveryCache.value;
    }
    const response = await fetch(
      `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) throw new Error('OIDC discovery request failed');
    const value = (await response.json()) as OidcDiscovery;
    if (!value.issuer || !value.jwks_uri) throw new Error('Invalid OIDC discovery document');
    if (
      process.env.NODE_ENV === 'production' &&
      new URL(value.jwks_uri).protocol !== 'https:'
    ) {
      throw new Error('OIDC signing keys must be served over HTTPS');
    }
    this.discoveryCache = { value, expiresAt: Date.now() + 5 * 60 * 1000 };
    return value;
  }

  private async getJwks(uri: string, forceRefresh = false): Promise<Jwks> {
    const now = Date.now();
    if (!forceRefresh && this.jwksCache && this.jwksCache.expiresAt > now) {
      return this.jwksCache.value;
    }
    if (
      forceRefresh &&
      this.jwksCache &&
      now - this.lastJwksRefreshAt < 15_000
    ) {
      return this.jwksCache.value;
    }
    const response = await fetch(uri, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('OIDC key request failed');
    const value = (await response.json()) as Jwks;
    if (!Array.isArray(value.keys)) throw new Error('Invalid OIDC key set');
    this.jwksCache = { value, expiresAt: Date.now() + 5 * 60 * 1000 };
    this.lastJwksRefreshAt = Date.now();
    return value;
  }
}
