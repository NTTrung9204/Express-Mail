import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.APP_ENV === 'development') {
    // Đặt basic auth cho API endpoints, không phải swagger UI
    app.use(
      ['/api/v1'], // Chỉ bảo vệ API endpoints
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
        'JWT-auth', // This needs to match @ApiBearerAuth() in controllers
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
