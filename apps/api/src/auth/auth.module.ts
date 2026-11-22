import { Module } from '@nestjs/common';
import { OidcAuthService } from './oidc-auth.service.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  providers: [OidcAuthService, RolesGuard],
  exports: [OidcAuthService, RolesGuard],
})
export class AuthModule {}
