import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { IHrisConnectionService } from '../../types';
import { ServiceRegistry } from '../registry.service';
import {
  AuthStrategy,
  CONNECTORS_METADATA,
  OAuth2AuthData,
  providerToType,
} from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { OAuthCallbackParams } from '@@core/connections/@utils/types';

export type BamboohrOAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token: string;
};

@Injectable()
export class BamboohrConnectionService implements IHrisConnectionService {
  private readonly type: string;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(BamboohrConnectionService.name);
    this.registry.registerService('bamboohr', this);
    this.type = providerToType('bamboohr', 'hris', AuthStrategy.oauth2);
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'bamboohr',
          vertical: 'hris',
        },
      });

      //reconstruct the redirect URI that was passed in the githubend it must be the same
      const REDIRECT_URI = `${
        this.env.getDistributionMode() == 'selfhost'
          ? this.env.getWebhookIngress()
          : this.env.getPanoraBaseUrl()
      }/connections/oauth/callback`;

      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        redirect_uri: REDIRECT_URI,
        code: code,
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        grant_type: 'authorization_code',
        scope: CONNECTORS_METADATA['hris']['bamboohr'].scopes,
      });
      const res = await axios.post(
        `https://<company>.bamboohr.com/token.php?request=token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: BamboohrOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : bamboohr hris ' + JSON.stringify(data),
      );

      const formData_ = new URLSearchParams({
        id_token: data.id_token,
        applicationKey: '', // TODO
      });
      //fetch the api key of the user
      const res_ = await axios.post(
        `https://api.bamboohr.com/api/gateway.php/{company}/v1/oidcLogin`,
        formData_.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data_: {
        success: boolean;
        userId: number;
        employeeId: number;
        key: string;
      } = res_.data;
      this.logger.log(
        'OAuth credentials : bamboohr hris apikey res ' + JSON.stringify(data_),
      );

      let db_res;
      const connection_token = uuidv4();

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data_.key),
            account_url: `https://api.bamboohr.com/api/gateway.php/{company}`,
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'bamboohr',
            vertical: 'hris',
            token_type: 'oauth',
            account_url: `https://api.bamboohr.com/api/gateway.php/{company}`,
            access_token: this.cryptoService.encrypt(data_.key),
            status: 'valid',
            created_at: new Date(),
            projects: {
              connect: { id_project: projectId },
            },
            linked_users: {
              connect: {
                id_linked_user: await this.connectionUtils.getLinkedUserId(
                  projectId,
                  linkedUserId,
                ),
              },
            },
          },
        });
      }
      return db_res;
    } catch (error) {
      throw error;
    }
  }
}
