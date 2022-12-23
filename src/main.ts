import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { WinstonModule } from 'nest-winston';
import * as morgan from 'morgan';
import * as compression from 'compression';
import { transports } from './configs/winston.config';
import { ContextInterceptor } from '@/interceptors/context.interceptor';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: transports,
    }),
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTION',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(express.json({ limit: '500mb' }));
  app.use(
    express.urlencoded({
      limit: '500mb',
      parameterLimit: 500000,
      extended: true,
    }),
  );

  app.use(
    morgan(
      '\x1b[32m:date[web] :method :status :url :response-time ms --- :res[content-length]',
    ),
  );

  // swagger
  const configSwagger = new DocumentBuilder()
    .setTitle('VRClass API')
    .setDescription('VRClass API document page')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document);

  // end swagger

  app.use(helmet());
  app.use(compression());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.useGlobalInterceptors(new ContextInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorObj = {};
        errors.forEach((err) => {
          if (errorObj[err.property]) {
            errorObj[err.property] = errorObj[err.property].concat(
              Object.values(err.constraints),
            );
          } else {
            errorObj[err.property] = Object.values(err.constraints);
          }
        });

        return new UnprocessableEntityException({ errors: errorObj });
      },
    }),
  );

  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  });

  await app.listen(3000);
}
bootstrap();
