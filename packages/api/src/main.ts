import * as Sentry from '@sentry/node';
import '@@core/sentry/instrument';
import {
  BaseExceptionFilter,
  HttpAdapterHost,
  NestFactory,
} from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Unified Panora API')
    .setDescription('The Panora API description')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  SwaggerModule.setup('docs', app, document);
  //fs.writeFileSync('./swagger/swagger-spec.yaml', yaml.dump(document));
  fs.writeFileSync(
    './swagger/swagger-spec.json',
    JSON.stringify(document, null, 2),
  );
  app.use(cors());
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.use(cookieParser());

  if(process.env.SENTRY_ENABLED == 'TRUE'){
    const { httpAdapter } = app.get(HttpAdapterHost);
    Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));
  }
  await app.listen(3000);
}
bootstrap();
