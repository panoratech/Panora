import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ConnectionStrategiesError } from '@@core/utils/errors';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthData,
  AuthStrategy,
  CONNECTORS_METADATA,
  extractAuthMode,
  extractProvider,
  extractVertical,
  needsSubdomain,
  needsScope,
  OAuth2AuthData,
  SoftwareMode,
} from '@panora/shared';
import { v4 as uuidv4 } from 'uuid';

export type OAuth = {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
};

export type RateLimit = {
  ttl: string;
  limit: string;
};

@Injectable()
export class ConnectionsStrategiesService {
  constructor(
    private prisma: PrismaService,
    private crypto: EncryptionService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  async isCustomCredentials(projectId: string, type: string) {
    try {
      const res = await this.prisma.connection_strategies.findFirst({
        where: {
          id_project: projectId,
          type: type,
          status: true,
        },
      });
      this.logger.log(JSON.stringify(res));
      if (!res) return false;
      return res.status;
    } catch (error) {
      throw error;
    }
  }

  async createConnectionStrategy(
    projectId: string,
    type: string,
    attributes: string[],
    values: string[],
    status?: boolean,
  ) {
    try {
      const checkCSDuplicate =
        await this.prisma.connection_strategies.findFirst({
          where: {
            id_project: projectId,
            type: type,
          },
        });
      if (checkCSDuplicate)
        throw new ConnectionStrategiesError({
          name: 'CONNECTION_STRATEGY_ALREADY_EXISTS',
          message: `Connection strategy already exists for projectId=${projectId} and type=${type}`,
        });

      const cs = await this.prisma.connection_strategies.create({
        data: {
          id_connection_strategy: uuidv4(),
          id_project: projectId,
          type: type,
          status: status || true,
        },
      });
      const entity = await this.prisma.cs_entities.create({
        data: {
          id_cs_entity: uuidv4(),
          id_connection_strategy: cs.id_connection_strategy,
        },
      });
      for (let i = 0; i < attributes.length; i++) {
        const attribute_slug = attributes[i];
        const value = values[i];
        //create all attributes (for oauth =>  client_id, client_secret)
        //console.log(`Attribute : ${attribute_slug}, value: ${value}`);
        const attribute_ = await this.prisma.cs_attributes.create({
          data: {
            id_cs_attribute: uuidv4(),
            id_cs_entity: entity.id_cs_entity,
            attribute_slug: attribute_slug,
            data_type: 'string',
          },
        });
        const value_ = await this.prisma.cs_values.create({
          data: {
            id_cs_value: uuidv4(),
            value: this.crypto.encrypt(value),
            id_cs_attribute: attribute_.id_cs_attribute,
          },
        });
      }

      return cs;
    } catch (error) {
      throw error;
    }
  }

  async toggle(id_cs: string) {
    try {
      const cs = await this.prisma.connection_strategies.findFirst({
        where: {
          id_connection_strategy: id_cs,
        },
      });
      if (!cs) throw new ReferenceError('Connection strategy undefined !');
      // Toggle the 'active' value
      const updatedCs = await this.prisma.connection_strategies.update({
        where: {
          id_connection_strategy: id_cs,
        },
        data: {
          status: !cs.status, // Toggle the 'active' value
        },
      });

      return updatedCs;
    } catch (error) {
      throw error;
    }
  }

  // one must provide an array of attributes to get the associated values i.e
  // [client_id, client_secret] or [client_id, client_secret, subdomain] or [api_key]
  async getConnectionStrategyData(
    projectId: string,
    type: string,
    attributes: string[],
  ) {
    const cs = await this.prisma.connection_strategies.findFirst({
      where: {
        id_project: projectId,
        type: type,
      },
    });
    if (!cs) throw new ReferenceError('Connection strategy undefined !');
    const entity = await this.prisma.cs_entities.findFirst({
      where: {
        id_connection_strategy: cs.id_connection_strategy,
      },
    });
    if (!entity)
      throw new ReferenceError('Connection strategy entity undefined !');

    const authValues: string[] = [];
    for (let i = 0; i < attributes.length; i++) {
      const attribute_slug = attributes[i];
      //create all attributes (for oauth =>  client_id, client_secret)
      const attribute_ = await this.prisma.cs_attributes.findFirst({
        where: {
          id_cs_entity: entity.id_cs_entity,
          attribute_slug: attribute_slug,
        },
      });
      if (!attribute_)
        throw new ReferenceError('Connection Strategy Attribute undefined !');
      const value_ = await this.prisma.cs_values.findFirst({
        where: {
          id_cs_attribute: attribute_.id_cs_attribute,
        },
      });
      if (!value_)
        throw new ReferenceError('Connection Strategy Value undefined !');
      authValues.push(this.crypto.decrypt(value_.value));
    }
    return authValues;
  }

  async getCustomCredentialsData(
    projectId: string,
    type: string,
    provider: string,
    vertical: string,
    authStrategy: AuthStrategy,
  ) {
    let attributes: string[] = [];
    switch (authStrategy) {
      case AuthStrategy.oauth2:
        const dynamic_attributes =
          CONNECTORS_METADATA[vertical.toLowerCase()][provider.toLowerCase()]
            ?.options?.oauth_attributes || [];
        attributes = ['client_id', 'client_secret', ...dynamic_attributes];
        if (needsSubdomain(provider.toLowerCase(), vertical.toLowerCase())) {
          attributes.push('subdomain');
        }
        if (needsScope(provider.toLowerCase(), vertical.toLowerCase())) {
          attributes.push('scope');
        }
        break;
      case AuthStrategy.api_key:
        attributes = ['api_key'];
        if (needsScope(provider.toLowerCase(), vertical.toLowerCase())) {
          attributes.push('scope');
        }
        if (needsSubdomain(provider.toLowerCase(), vertical.toLowerCase())) {
          attributes.push('subdomain');
        }
        break;
      case AuthStrategy.basic:
        attributes = ['username', 'secret'];
        if (needsSubdomain(provider.toLowerCase(), vertical.toLowerCase())) {
          attributes.push('subdomain');
        }
        if (needsScope(provider.toLowerCase(), vertical.toLowerCase())) {
          attributes.push('scope');
        }
        break;
      default:
        break;
    }
    const values = await this.getConnectionStrategyData(
      projectId,
      type,
      attributes,
    );
    const data = attributes.reduce((acc, attr, index) => {
      acc[attr.toUpperCase()] = values[index];
      return acc;
    }, {} as Record<string, string>);

    return data as AuthData;
  }

  getEnvData(
    provider: string,
    vertical: string,
    authStrategy: AuthStrategy,
    softwareMode?: SoftwareMode,
  ) {
    let data: AuthData;
    switch (authStrategy) {
      case AuthStrategy.oauth2:
        data = {
          CLIENT_ID: this.configService.get<string>(
            `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_CLIENT_ID`,
          ),
          CLIENT_SECRET: this.configService.get<string>(
            `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_CLIENT_SECRET`,
          ),
        };
        const scopes =
          CONNECTORS_METADATA[vertical.toLowerCase()][provider.toLowerCase()]
            .scopes;
        if (scopes) {
          data = {
            ...data,
            SCOPE:
              CONNECTORS_METADATA[vertical.toLowerCase()][
                provider.toLowerCase()
              ].scopes,
          };
        }
        /*const isSubdomain = needsSubdomain(
          provider.toLowerCase(),
          vertical.toLowerCase(),
        );*/
        // console.log('needs subdomain ??? ' + isSubdomain);
        if (needsSubdomain(provider.toLowerCase(), vertical.toLowerCase())) {
          data = {
            ...data,
            SUBDOMAIN: this.configService.get<string>(
              `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_SUBDOMAIN`,
            ),
          };
        }
        const object =
          CONNECTORS_METADATA[vertical.toLowerCase()][provider.toLowerCase()];
        if (object.options && object.options.oauth_attributes) {
          const dynamic_attributes = object.options.oauth_attributes;
          for (const attr of dynamic_attributes) {
            data = {
              ...data,
              [attr.toUpperCase()]: this.configService.get<string>(
                `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_${attr.toUpperCase()}`,
              ),
            };
          }
        }
        return data;
      case AuthStrategy.api_key:
        data = {
          API_KEY: this.configService.get<string>(
            `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_API_KEY`,
          ),
        };
        if (needsSubdomain(provider.toLowerCase(), vertical.toLowerCase())) {
          data = {
            ...data,
            SUBDOMAIN: this.configService.get<string>(
              `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_SUBDOMAIN`,
            ),
          };
        }
        return data;
      case AuthStrategy.basic:
        data = {
          USERNAME: this.configService.get<string>(
            `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_USERNAME`,
          ),
          SECRET: this.configService.get<string>(
            `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_SECRET`,
          ),
        };
        if (needsSubdomain(provider.toLowerCase(), vertical.toLowerCase())) {
          data = {
            ...data,
            SUBDOMAIN: this.configService.get<string>(
              `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_SUBDOMAIN`,
            ),
          };
        }
        return data;
    }
  }

  isOAuth2AuthData(data: AuthData): data is OAuth2AuthData {
    return (
      (data as OAuth2AuthData).CLIENT_ID !== undefined &&
      (data as OAuth2AuthData).CLIENT_SECRET !== undefined
    );
  }

  async getSafeCredentials(projectId: string, type: string) {
    try {
      const res = await this.getCredentials(projectId, type);

      if (this.isOAuth2AuthData(res)) {
        const { CLIENT_SECRET, ...safeData } = res;
        return safeData;
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getCredentials(projectId: string, type: string): Promise<AuthData> {
    try {
      const isCustomCred = await this.isCustomCredentials(projectId, type);
      const provider = extractProvider(type);
      const vertical = extractVertical(type);
      //TODO: extract sofwtaremode
      if (!vertical)
        throw new ReferenceError(`vertical not found for provider ${provider}`);
      const authStrategy = extractAuthMode(type);
      if (!authStrategy)
        throw new ReferenceError(
          `auth strategy not found for provider ${provider}`,
        );

      if (isCustomCred) {
        //customer is using custom credentials (set in the webapp UI)
        //fetch the right credentials
        return await this.getCustomCredentialsData(
          projectId,
          type,
          provider,
          vertical,
          authStrategy,
        );
      } else {
        // type is of form = HUBSPOT_CRM_CLOUD_OAUTH so we must extract the parts
        const res = this.getEnvData(
          provider,
          vertical,
          authStrategy,
          SoftwareMode.cloud,
        );
        return res;
      }
    } catch (error) {
      throw error;
    }
  }

  async getConnectionStrategiesForProject(projectId: string) {
    try {
      return await this.prisma.connection_strategies.findMany({
        where: {
          id_project: projectId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateConnectionStrategy(
    id_cs: string,
    status: boolean,
    attributes: string[],
    values: string[],
  ) {
    try {
      const cs = await this.prisma.connection_strategies.findFirst({
        where: {
          id_connection_strategy: id_cs,
        },
      });
      if (!cs) throw new ReferenceError('Connection strategy undefined !');

      const updateCS = await this.prisma.connection_strategies.update({
        where: {
          id_connection_strategy: id_cs,
        },
        data: {
          status: status,
        },
      });

      const { id_cs_entity } = await this.prisma.cs_entities.findFirst({
        where: {
          id_connection_strategy: id_cs,
        },
      });

      if (!id_cs_entity)
        throw new ReferenceError('Connection strategy entity undefined !');

      for (let i = 0; i < attributes.length; i++) {
        const attribute_slug = attributes[i];
        const value = values[i];

        // Updating attributes' values
        const { id_cs_attribute } = await this.prisma.cs_attributes.findFirst({
          where: {
            id_cs_entity: id_cs_entity,
            attribute_slug: attribute_slug,
            data_type: 'string',
          },
        });
        const value_ = await this.prisma.cs_values.updateMany({
          where: {
            id_cs_attribute: id_cs_attribute,
          },
          data: {
            value: this.crypto.encrypt(value),
          },
        });
      }
      return cs;
    } catch (error) {
      throw error;
    }
  }

  async deleteConnectionStrategy(id_cs: string) {
    try {
      const cs = await this.prisma.connection_strategies.findFirst({
        where: {
          id_connection_strategy: id_cs,
        },
      });
      if (!cs) throw new ReferenceError('Connection strategy undefined !');

      const { id_cs_entity } = await this.prisma.cs_entities.findFirst({
        where: {
          id_connection_strategy: id_cs,
        },
      });
      if (!id_cs_entity)
        throw new ReferenceError('Connection strategy entity undefined !');

      const attributes = await this.prisma.cs_attributes.findMany({
        where: {
          id_cs_entity: id_cs_entity,
        },
      });

      // Deleting all attributes' values
      for (let i = 0; i < attributes.length; i++) {
        const attributeObj = attributes[i];

        const deleteValue = await this.prisma.cs_values.deleteMany({
          where: {
            id_cs_attribute: attributeObj.id_cs_attribute,
          },
        });
      }

      // Delete All Attribute
      const deleteAllAttributes = await this.prisma.cs_attributes.deleteMany({
        where: {
          id_cs_entity: id_cs_entity,
        },
      });

      // Delete cs_entity
      const delete_cs_entity = await this.prisma.cs_entities.deleteMany({
        where: {
          id_connection_strategy: id_cs,
        },
      });

      const deleteCS = await this.prisma.connection_strategies.delete({
        where: {
          id_connection_strategy: id_cs,
        },
      });

      return deleteCS;
    } catch (error) {
      throw error;
    }
  }
}
