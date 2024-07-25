import '@@core/@core-services/sentry/instrument';
import * as Sentry from '@sentry/node';
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
import * as yaml from 'js-yaml';

function addSpeakeasyGroup(document: any) {
  for (const path in document.paths) {
    const pathParts = path.split('/').filter((part) => part);
    let groupName;

    if (pathParts[0] === 'webhook') {
      groupName = 'webhook';
    } else if (pathParts[0] === 'sync') {
      groupName = 'sync';
    } else if (pathParts[0] === 'linked-users') {
      groupName = 'linkedUsers';
    } else if (pathParts[0] === 'field-mappings') {
      groupName = 'fieldMappings';
    } else if (pathParts.length >= 2) {
      groupName = `${pathParts[0].toLowerCase()}.${pathParts[1].toLowerCase()}`;
    }

    if (groupName) {
      for (const method in document.paths[path]) {
        document.paths[path][method]['x-speakeasy-group'] = groupName;
      }
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Unified Panora API')
    .setDescription('The Panora API description')
    .setVersion('1.0')
    .addServer('https://api.panora.dev', 'Production server')
    .addServer('https://api-sandbox.panora.dev', 'Sandbox server')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Dynamically add extended specs
  const extendedSpecs = {
    'x-speakeasy-name-override': [
      { operationId: '^retrieve.*', methodNameOverride: 'retrieve' },
      { operationId: '^list.*', methodNameOverride: 'list' },
      { operationId: '^create.*', methodNameOverride: 'create' },
    ],
  };
  document['x-speakeasy-name-override'] =
    extendedSpecs['x-speakeasy-name-override']; // Add extended specs
  addSpeakeasyGroup(document);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  SwaggerModule.setup('docs', app, document);
  fs.writeFileSync('./swagger/swagger-spec.yaml', yaml.dump(document));
  /*fs.writeFileSync(
    './swagger/swagger-spec.json',
    JSON.stringify(document, null, 2),
  );*/
  app.use(cors());
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
