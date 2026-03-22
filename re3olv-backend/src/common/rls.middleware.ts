import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

export const als = new AsyncLocalStorage<{ orgId: string }>();

@Injectable()
export class RlsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const orgId = req.headers['x-organization-id'] as string;
    if (orgId) {
      als.run({ orgId }, () => next());
    } else {
      next();
    }
  }
}
