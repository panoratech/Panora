import { NestFactory } from '@nestjs/core';
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


  // Passing a host is required by some PaaS providers such as flightcontrol
  const port = process.env.BACKEND_PORT || 3000; 
  const host = process.env.BACKEND_HOSTNAME || '0.0.0.0';
  await app.listen(port, host);
}
bootstrap();
