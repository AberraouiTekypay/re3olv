import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { GlobalErrorFilter } from './common/filters/global-error.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const production = process.env.NODE_ENV === 'production';
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (production && !configuredOrigins) {
    throw new Error('CORS_ALLOWED_ORIGINS must be configured in production');
  }
  const origins = (configuredOrigins || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      const url = new URL(origin);
      if (url.origin !== origin || url.username || url.password || (production && url.protocol !== 'https:')) {
        throw new Error('CORS_ALLOWED_ORIGINS must contain exact HTTPS origins in production');
      }
      return origin;
    });
  const trustProxyHops = process.env.TRUST_PROXY_HOPS;
  if (trustProxyHops !== undefined) {
    const hops = Number(trustProxyHops);
    if (!Number.isSafeInteger(hops) || hops < 0 || hops > 10) {
      throw new Error('TRUST_PROXY_HOPS must be an integer from 0 to 10');
    }
    app.getHttpAdapter().getInstance().set('trust proxy', hops);
  }
  app.enableShutdownHooks();
  app.enableCors({
    origin: origins,
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Borrower-Token'],
    maxAge: 600,
  });
  app.getHttpAdapter().getInstance().use((_request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (production) response.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    next();
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new GlobalErrorFilter());

  const config = new DocumentBuilder()
    .setTitle('RE3OLV Institutional API')
    .setDescription(
      'The core API suite for debt resolution, advocacy logic, and institutional analytics.',
    )
    .setVersion('1.0')
    .addTag('cases', 'Institutional Case Management')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
