import {
  CanActivate,
  ExecutionContext,
  Injectable,
  TooManyRequestsException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class PublicRequestLimitGuard implements CanActivate {
  private readonly windows = new Map<string, { startedAt: number; count: number }>();
  private readonly windowMs = this.configuredPositiveInteger(
    'PUBLIC_RATE_LIMIT_WINDOW_MS',
    60_000,
  );
  private readonly defaultLimit = this.configuredPositiveInteger(
    'PUBLIC_RATE_LIMIT_REQUESTS',
    60,
  );
  private readonly hardshipLimit = this.configuredPositiveInteger(
    'HARDSHIP_RATE_LIMIT_REQUESTS',
    10,
  );
  private readonly uploadLimit = this.configuredPositiveInteger(
    'UPLOAD_RATE_LIMIT_REQUESTS',
    10,
  );

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const client = request.ip || request.socket.remoteAddress || 'unknown';
    const route = String(request.route?.path || request.path);
    const key = `${client}:${route}`;
    const now = Date.now();
    let window = this.windows.get(key);
    if (!window || now - window.startedAt >= this.windowMs) {
      window = { startedAt: now, count: 0 };
      this.windows.set(key, window);
    }
    window.count++;

    if (this.windows.size > 50_000) {
      for (const [storedKey, storedWindow] of this.windows) {
        if (now - storedWindow.startedAt >= this.windowMs) {
          this.windows.delete(storedKey);
        }
      }
      while (this.windows.size > 50_000) {
        const oldestKey = this.windows.keys().next().value;
        if (!oldestKey) break;
        this.windows.delete(oldestKey);
      }
    }

    const limit = route.endsWith('/:id/hardship')
      ? this.hardshipLimit
      : route.endsWith('/upload')
        ? this.uploadLimit
        : this.defaultLimit;
    if (window.count > limit) {
      throw new TooManyRequestsException('Request limit exceeded');
    }
    return true;
  }

  private configuredPositiveInteger(name: string, fallback: number): number {
    const raw = process.env[name];
    if (!raw) return fallback;
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new Error(`${name} must be a positive integer`);
    }
    return value;
  }
}
