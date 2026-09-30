import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module';
import {
  FOTOS_REPORTES_DIR,
  FOTOS_TMP_DIR,
  UPLOADS_ROOT,
} from './reportes/uploads.paths';
import { loadEnvFile } from 'node:process';
loadEnvFile();

/**
 * Punto de entrada de la API. Levanta la aplicación NestJS, activa la
 * validación global de DTOs (`class-validator`), sirve `uploads/`
 * como estáticos (fotos de reportes, ver `reportes/uploads.paths.ts`)
 * y publica la documentación OpenAPI/Swagger en `/api`.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // `diskStorage` (multer) no crea carpetas de destino por su cuenta:
  // hay que asegurarlas antes de que llegue el primer upload.
  mkdirSync(FOTOS_TMP_DIR, { recursive: true });
  mkdirSync(FOTOS_REPORTES_DIR, { recursive: true });

  // Publica todo lo que haya bajo uploads/ (temporales y definitivas)
  // en /uploads/*, para que las fotos sean visibles por URL pública.
  app.useStaticAssets(UPLOADS_ROOT, { prefix: '/uploads/' });

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