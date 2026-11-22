import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { GlobalErrorFilter } from './common/filters/global-error.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const trustProxyHops = process.env.TRUST_PROXY_HOPS;
  if (trustProxyHops !== undefined) {
    const hops = Number(trustProxyHops);
    if (!Number.isSafeInteger(hops) || hops < 0 || hops > 10) {
      throw new Error('TRUST_PROXY_HOPS must be an integer from 0 to 10');
    }
    app.getHttpAdapter().getInstance().set('trust proxy', hops);
  }
  app.enableShutdownHooks();
  app.enableCors();
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
