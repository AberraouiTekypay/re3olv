import { SetMetadata } from '@nestjs/common';

export type UserRole = 'AGENT' | 'MANAGER' | 'PLATFORM_ADMIN';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const PUBLIC_ROUTE_KEY = 'public-route';
export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
