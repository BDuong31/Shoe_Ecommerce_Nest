import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as swaggerUi from 'swagger-ui-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('E-commerce Shoe API')
    .setDescription('API documentation for the E-commerce Shoe application')
    .setVersion('1.0')
    .addTag('ecommerceShoe')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document, {
    customJs: '/assets/swagger.js',
    customfavIcon: 'http://localhost:3000/assets/logo.png',
    customSiteTitle: 'E-commerce Shoe API Docs',
  }));


  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
