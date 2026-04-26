import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModulo } from './app.modulo';

async function arrancar() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModulo, { logger: ['error', 'warn', 'log'] });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const configuracionSwagger = new DocumentBuilder()
    .setTitle('Sistema CAL — API')
    .setDescription('Cambridge Academy of Languages — API REST')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const documento = SwaggerModule.createDocument(app, configuracionSwagger);
  SwaggerModule.setup('api/docs', app, documento);

  const puerto = process.env.PORT || 3000;
  await app.listen(puerto);
  logger.log(`Servidor escuchando en http://localhost:${puerto}/api`);
  logger.log(`Documentación en http://localhost:${puerto}/api/docs`);
}

arrancar();
