import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CasesModule } from './cases/cases.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { UsersModule } from './users/users.module.js';
import { RlsMiddleware } from './common/rls.middleware.js';

@Module({
  imports: [AuthModule, CasesModule, PaymentsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RlsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
