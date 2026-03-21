import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userRole = request.headers['x-user-role'] as UserRole;
    const orgId = request.headers['x-organization-id'];

    // Store in request for easy access in controller
    request['orgId'] = orgId;
    request['userRole'] = userRole;

    // If no roles required, it's a portal/public route - allow but restrict orgId if present
    if (!requiredRoles) {
      return true;
    }

    // Strict institutional enforcement
    if (!orgId) {
      throw new ForbiddenException('Institutional access requires an Organization ID');
    }

    // Role check
    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Insufficient permissions: ${requiredRoles.join('/')} required`);
    }

    return true;
  }
}
