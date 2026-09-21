import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Punto de entrada de la API. Levanta la aplicación NestJS, activa la
 * validación global de DTOs (`class-validator`) y publica la
 * documentación OpenAPI/Swagger en `/api`.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('0Fraud Stay API')
    .setDescription(
      'API REST del sistema de reporte de fraudes en rentas vacacionales. ' +
        'Todos los endpoints, salvo /auth/*, requieren un token Bearer ' +
        'obtenido en POST /auth/login.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de acceso devuelto por POST /auth/login',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
