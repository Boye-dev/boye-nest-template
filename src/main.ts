// import * as csurf from 'csurf';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotAcceptableException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(helmet());
  const domain = configService.get<string>('DOMAIN_NAME');

  const corsOptions = {
    credentials: true,
    origin: domain,
  };
  app.enableCors(corsOptions);

  const config = new DocumentBuilder()
    .setTitle('Template Api')
    .setDescription('This is the api documentation for template ')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const formattedErrors = [];

        function formatErrors(errors: ValidationError[]) {
          for (const error of errors) {
            if (error.children && error.children.length > 0) {
              formatErrors(error.children);
            } else {
              formattedErrors.push({
                field: error.property,
                errors: Object.values(error.constraints),
              });
            }
          }
        }

        formatErrors(validationErrors);

        return new NotAcceptableException(formattedErrors);
      },
    }),
  );
  // app.use(csurf());

  const serverPort = configService.get<number>('SERVER_PORT');
  const port = configService.get<number>('PORT');
  await app.listen(port || serverPort);

  console.log(`Server is listening on port ${port || serverPort}...`);
}
bootstrap();
