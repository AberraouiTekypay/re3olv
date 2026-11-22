import { Module } from '@nestjs/common';
import { OidcAuthService } from './oidc-auth.service.js';
import { RolesGuard } from './roles.guard.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  providers: [OidcAuthService, RolesGuard],
  exports: [OidcAuthService, RolesGuard],
})
export class AuthModule {}
