import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LinkService } from './link.service.js';

@Injectable()
export class BorrowerTokenGuard implements CanActivate {
  constructor(private readonly linkService: LinkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const caseId = request.params.id as string | undefined;
    const header = request.headers['x-borrower-token'];
    const token =
      typeof header === 'string'
        ? header
        : typeof request.query.token === 'string'
          ? request.query.token
          : undefined;

    if (!caseId || !token || !(await this.linkService.validateToken(caseId, token))) {
      throw new UnauthorizedException('A valid borrower access token is required');
    }
    return true;
  }
}
