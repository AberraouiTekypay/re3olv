import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { GlobalErrorFilter } from './common/filters/global-error.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalErrorFilter());

  const config = new DocumentBuilder()
    .setTitle('RE3OLV Institutional API')
    .setDescription(
      'The core API suite for debt resolution, advocacy logic, and institutional analytics.',
    )
    .setVersion('1.0')
    .addTag('cases', 'Institutional Case Management')
    .addApiKey(
      { type: 'apiKey', name: 'x-organization-id', in: 'header' },
      'x-organization-id',
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-user-role', in: 'header' },
      'x-user-role',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
