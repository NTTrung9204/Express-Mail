import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
      transform: true,
    }),
  );

  if (process.env.APP_ENV === 'development') {
    app.use(
      ['/api/v1'],
      basicAuth({
        users: {
          [process.env.SWAGGER_USER ?? '']: process.env.SWAGGER_PASSWORD ?? '',
        },
        challenge: true,
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('Express Mail NestJS API')
      .setDescription('API documentation for Express Mail application')
      .setVersion('1.0')
      .addTag('Products')
      .addTag('Orders')
      .addTag('Shipping')
      .addBearerAuth(
        {
          description: 'Please enter JWT token',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
          name: 'Authorization',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        security: [{ 'JWT-auth': [] }],
      },
    });

    console.log(
      `Swagger documentation: http://localhost:${process.env.APP_PORT ?? 3000}/api`,
    );
  }

  await app.listen(process.env.APP_PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.APP_PORT ?? 3000}`,
  );
}
bootstrap();
