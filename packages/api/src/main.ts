import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';
import { generatePanoraParamsSpec } from '@@core/utils/decorators/utils';
import { AllExceptionsFilter } from '@@core/utils/exception.filter';

function addSpeakeasyGroup(document: any) {
  for (const path in document.paths) {
    const pathParts = path.split('/').filter((part) => part);
    let groupName;

    if (pathParts[0] === 'passthrough') {
      groupName = 'passthrough';
    }
    if (pathParts[0] === 'webhooks') {
      groupName = 'webhooks';
    } else if (pathParts[0] === 'sync') {
      groupName = 'sync';
    } else if (pathParts[0] === 'linked_users') {
      groupName = 'linkedUsers';
    } else if (pathParts[0] === 'field_mappings') {
      groupName = 'fieldMappings';
    } else if (pathParts.length >= 2) {
      groupName = `${pathParts[0].toLowerCase()}.${pathParts[1].toLowerCase()}`;
    }

    if (groupName) {
      for (const method in document.paths[path]) {
        if (groupName === 'rag.query') {
          groupName = 'rag';
        }
        document.paths[path][method]['x-speakeasy-group'] = groupName;
        if (
          groupName !== 'webhooks' &&
          groupName !== 'linkedUsers' &&
          method === 'get' &&
          document.paths[path][method]['operationId'].startsWith('list')
        ) {
          document.paths[path][method]['x-speakeasy-pagination'] = {
            type: 'cursor',
            inputs: [
              {
                name: 'cursor',
                in: 'parameters',
                type: 'cursor',
              },
            ],
            outputs: {
              nextCursor: '$.next_cursor',
            },
          };
        }
      }
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Panora API')
    .setDescription('A unified API to ship integrations')
    .setVersion('1.0')
    .addServer('https://api.panora.dev', 'Production server')
    .addServer('https://api-sandbox.panora.dev', 'Sandbox server')
    .addServer('https://api-dev.panora.dev', 'Development server')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'api_key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ api_key: [] }];

  // Dynamically add extended specs
  const extendedSpecs = {
    'x-speakeasy-name-override': [
      { operationId: '^retrieve.*', methodNameOverride: 'retrieve' },
      { operationId: '^list.*', methodNameOverride: 'list' },
      { operationId: '^create.*', methodNameOverride: 'create' },
    ],
  };
  document['x-speakeasy-name-override'] =
    extendedSpecs['x-speakeasy-name-override'];
  addSpeakeasyGroup(document);

  // TODO: await generatePanoraParamsSpec(document);

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

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
