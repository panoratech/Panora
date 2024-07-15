/* 
(USED BY PANORA INTERNAL TEAM)

THIS SCRIPT ADDS ALL DEPENDENCIES AND BOILERPLATE CODE WHEN A NEW 3RD PARTY AUTHENTICATION SERVICE HAS TO BE BUILT
  pnpm run prebuild-oauth-connector --vertical="crm" --provider="hubspot"

*/

import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const paths = [
  path.join(__dirname, `../../../docker-compose.dev.yml`),
  path.join(__dirname, `../../../docker-compose.source.yml`),
  path.join(__dirname, `../../../docker-compose.yml`),
];
const envServiceFilePath = path.join(
  __dirname,
  `../src/@core/environment/environment.service.ts`,
);

function createServiceFile(vertical, provider) {
  // Create the directory path
  const dirPath = path.join(
    __dirname,
    `../src/@core/connections/${vertical}/services/${provider}`,
  );
  fs.mkdirSync(dirPath, { recursive: true });
  const providerUpper = provider.slice(0, 1).toUpperCase() + provider.slice(1);
  const verticalUpper = vertical.slice(0, 1).toUpperCase() + vertical.slice(1);

  // Define the content of the service file
  const serviceFileContent = `
import { Injectable } from '@nestjs/common'; 
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import {
  Action,
  ActionType,
  ConnectionsError,
  format3rdPartyError,
  throwTypedError,
} from '@@core/utils/errors';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import {
  CallbackParams,
  RefreshParams,
  I${verticalUpper}ConnectionService,
} from '../../types';
import { ServiceRegistry } from '../registry.service';
import { AuthStrategy } from '@panora/shared';
import { OAuth2AuthData, providerToType } from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';

export type ${providerUpper}OAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string;
};

@Injectable()
export class ${providerUpper}ConnectionService implements I${verticalUpper}ConnectionService {
  private readonly type: string;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
private cService: ConnectionsStrategiesService,
    private connectionUtils: ConnectionUtils,  ) {
    this.logger.setContext(${providerUpper}ConnectionService.name);
    this.registry.registerService('${provider.toLowerCase()}', this);
    this.type = providerToType('${provider.toLowerCase()}', '${vertical.toLowerCase()}', AuthStrategy.oauth2);
  }

  async handleCallback(opts: CallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: '${provider.toLowerCase()}',
          vertical: '${vertical.toLowerCase()}'
        },
      });

      //reconstruct the redirect URI that was passed in the githubend it must be the same
      const REDIRECT_URI = \`\${this.env.getPanoraBaseUrl()}/connections/oauth/callback\`;
      const CREDENTIALS = (await this.cService.getCredentials(projectId, this.type)) as OAuth2AuthData;

      const formData = new URLSearchParams({
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
        grant_type: 'authorization_code',
      });
      const subdomain = 'panora';
      const res = await axios.post(
        "",
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: ${providerUpper}OAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : ${provider} ticketing ' + JSON.stringify(data),
      );

      let db_res;
      const connection_token = uuidv4();

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            account_url: "",
            expiration_timestamp: new Date(
              new Date().getTime() + Number(data.expires_in) * 1000,
            ),
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: '${provider.toLowerCase()}',
            vertical: '${vertical.toLowerCase()}',
            token_type: 'oauth',
            account_url: "",
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            expiration_timestamp: new Date(
              new Date().getTime() + Number(data.expires_in) * 1000,
            ),
            status: 'valid',
            created_at: new Date(),
            projects: {
              connect: { id_project: projectId },
            },
            linked_users: {
              connect: { id_linked_user: linkedUserId },
            },
          },
        });
      }
      return db_res;
    } catch (error) {
            throw error;

    }
  }
    
  async handleTokenRefresh(opts: RefreshParams) {
    try {
      const { connectionId, refreshToken, projectId } = opts;
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;
      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.cryptoService.decrypt(refreshToken),
      });
      const res = await axios.post(
        "",
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: \`Basic \${Buffer.from(
              \`\${CREDENTIALS.CLIENT_ID}:\${CREDENTIALS.CLIENT_SECRET}\`,
            ).toString('base64')}\`,
          },
        },
      );
      const data: ${providerUpper}OAuthResponse = res.data;
      await this.prisma.connections.update({
        where: {
          id_connection: connectionId,
        },
        data: {
          access_token: this.cryptoService.encrypt(data.access_token),
          refresh_token: this.cryptoService.encrypt(data.refresh_token),
          expiration_timestamp: new Date(
            new Date().getTime() + Number(data.expires_in) * 1000,
          ),
        },
      });
      this.logger.log('OAuth credentials updated : ${provider} ');
    } catch (error) {
            throw error;
  
    }
  }
} 
`;

  // Write the content to the service file
  const serviceFilePath = path.join(
    dirPath,
    `${provider.toLowerCase()}.service.ts`,
  );
  fs.writeFileSync(serviceFilePath, serviceFileContent);
  console.log(`Service file created at: ${serviceFilePath}`);
}

// Function to add provider to EnvironmentService.ts
/*function addProviderToEnvironmentService(provider, envServicePath) {
  const providerMethodName_ = provider
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('_');
  const providerMethodName = `get${providerMethodName_}Secret`;
  const providerEnvPrefix = provider.toUpperCase();

  const methodToAdd = `
  ${providerMethodName}(): OAuth {
    return {
      CLIENT_ID: this.configService.get<string>('${providerEnvPrefix}_CLIENT_ID'),
      CLIENT_SECRET: this.configService.get<string>('${providerEnvPrefix}_CLIENT_SECRET'),
    };
  }
  `;

  let content = fs.readFileSync(envServicePath, { encoding: 'utf8' });

  if (content.includes(providerMethodName)) {
    console.log(
      `${providerMethodName}() already exists in EnvironmentService.`,
    );
    return;
  }

  content = content.replace(/\}\n*$/, methodToAdd + '}\n');
  fs.writeFileSync(envServicePath, content);

  console.log(`Added ${providerMethodName}() to EnvironmentService.`);
}*/

// Function to add provider to docker-compose.dev.yml
function addProviderToDockerCompose(provider, vertical, dockerComposePath) {
  const providerEnvPrefix = provider.toUpperCase();
  const newEnvVariables = `
        ${providerEnvPrefix}_${vertical.toUpperCase()}_CLOUD_CLIENT_ID: $\{${providerEnvPrefix}_${vertical.toUpperCase()}_CLOUD_CLIENT_ID}
        ${providerEnvPrefix}_${vertical.toUpperCase()}_CLOUD_CLIENT_SECRET: $\{${providerEnvPrefix}_${vertical.toUpperCase()}_CLOUD_CLIENT_SECRET}
  `;

  let content = fs.readFileSync(dockerComposePath, { encoding: 'utf8' });

  if (
    content.includes(
      `${providerEnvPrefix}_${vertical.toUpperCase()}_CLOUD_CLIENT_ID`,
    )
  ) {
    console.log(
      `${providerEnvPrefix}_${vertical.toUpperCase()}_CLOUD_CLIENT_ID already exists in docker-compose.dev.yml.`,
    );
    return;
  }

  content = content.replace(
    /(api:\n.*?environment:.*?\n)(.*?)(\n\s+restart:)/s,
    `$1$2${newEnvVariables}$3`,
  );
  fs.writeFileSync(dockerComposePath, content);

  console.log(
    `Added ${provider}'s CLIENT_ID and CLIENT_SECRET to docker-compose.dev.yml.`,
  );
}

function handleUpdate(vertical, provider) {
  createServiceFile(vertical, provider);
  //addProviderToEnvironmentService(provider, envServiceFilePath);
  for (const path of paths) {
    addProviderToDockerCompose(provider, vertical, path);
  }
}

if (import.meta.url === process.argv[1]) {
  // Get command-line arguments
  const args = process.argv.slice(1);
  const vertical = args[0];
  const provider = args[1];
  createServiceFile(vertical, provider);
  //addProviderToEnvironmentService(provider, envServiceFilePath);
  for (const path of paths) {
    addProviderToDockerCompose(argv.provider, path);
  }
}

const argv = yargs(hideBin(process.argv)).argv;
handleUpdate(argv.vertical, argv.provider);
