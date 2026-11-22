import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_ROUTE_KEY, ROLES_KEY, UserRole } from './roles.decorator.js';
import { OidcAuthService } from './oidc-auth.service.js';

export interface AuthenticatedPrincipal {
  sub: string;
  orgId: string;
  role: UserRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly oidcAuthService: OidcAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();

    const isExplicitlyPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isExplicitlyPublic) {
      return true;
    }
    if (!requiredRoles?.length) {
      throw new ForbiddenException('This route has no access policy');
    }

    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string' && authorization.match(/^Bearer (.+)$/i);
    if (!match) {
      throw new UnauthorizedException('A valid OIDC access token is required');
    }

    const principal = await this.oidcAuthService.authenticate(match[1]);
    request['user'] = principal;
    request['orgId'] = principal.orgId;
    request['userRole'] = principal.role;

    if (!principal.orgId || !requiredRoles.includes(principal.role)) {
      throw new ForbiddenException(
        `Insufficient permissions: ${requiredRoles.join('/')} required`,
      );
    }

    return true;
  }
}
