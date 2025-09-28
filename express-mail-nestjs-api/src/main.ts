import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.APP_ENV === 'development') {
    app.use(
      ['/api'],
      basicAuth({
        users: {
          [process.env.SWAGGER_USER ?? '']: process.env.SWAGGER_PASSWORD ?? '',
        },
        challenge: true,
      }),
    );

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Express Mail NestJS API')
      .setDescription('API documentation for Express Mail application')
      .setVersion('1.0')
      .addTag('Products')
      .addTag('Orders')
      .addTag('Shipping')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    console.log(
      `Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api`,
    );
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
