import { PrismaService } from '@@core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthData,
  AuthStrategy,
  extractAuthMode,
  extractProvider,
  extractVertical,
  needsSubdomain,
  providersConfig,
} from '@panora/shared';
import { SoftwareMode } from '@panora/shared';
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
    private configService: ConfigService,
  ) {}

  async isCustomCredentials(projectId: string, type: string) {
    const res = await this.prisma.connection_strategies.findFirst({
      where: {
        id_project: projectId,
        type: type,
        status: true,
      },
    });
    if (!res) return false;
    return res.status;
  }

  async createConnectionStrategy(
    projectId: string,
    type: string,
    attributes: string[],
    values: string[],
  ) {
    const checkCSDuplicate = await this.prisma.connection_strategies.findFirst({
      where: {
        id_project: projectId,
        type: type,
      },
    });
    if (checkCSDuplicate)
      throw new Error('The Connection Strategy already exists!');

    const cs = await this.prisma.connection_strategies.create({
      data: {
        id_connection_strategy: uuidv4(),
        id_project: projectId,
        type: type,
        status: true,
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
      const attribute_ = await this.prisma.cs_attributes.create({
        data: {
          id_cs_attribute: uuidv4(),
          id_cs_entity: entity.id_cs_entity,
          attribute_slug: attribute_slug,
          data_type: 'string', //TODO
        },
      });
      const value_ = await this.prisma.cs_values.create({
        data: {
          id_cs_value: uuidv4(),
          value: value,
          id_cs_attribute: attribute_.id_cs_attribute,
        },
      });
    }

    return cs;
  }

  async toggle(id_cs: string) {
    try {
      const cs = await this.prisma.connection_strategies.findFirst({
        where: {
          id_connection_strategy: id_cs,
        },
      });
      if (!cs) throw new Error('No connection strategies found !');
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
      throw new Error(error);
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
    if (!cs) throw new Error('No connection strategies found !');
    const entity = await this.prisma.cs_entities.findFirst({
      where: {
        id_connection_strategy: cs.id_connection_strategy,
      },
    });
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
      if (!attribute_) throw new Error('No attribute found !');
      const value_ = await this.prisma.cs_values.findFirst({
        where: {
          id_cs_attribute: attribute_.id_cs_attribute,
        },
      });
      if (!value_) throw new Error('No value found !');
      authValues.push(value_.value);
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
        attributes = ['client_id', 'client_secret', 'scope'];
        if (needsSubdomain(provider, vertical)) {
          attributes.push('subdomain');
        }
        break;
      case AuthStrategy.api_key:
        attributes = ['api_key'];

        if (needsSubdomain(provider, vertical)) {
          attributes.push('subdomain');
        }
        break;
      case AuthStrategy.basic:
        attributes = ['username', 'secret'];
        if (needsSubdomain(provider, vertical)) {
          attributes.push('subdomain');
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
          SCOPE:
            providersConfig[vertical.toLowerCase()][provider.toLowerCase()]
              .scopes,
        };
        if (needsSubdomain(provider, vertical)) {
          data = {
            ...data,
            SUBDOMAIN: this.configService.get<string>(
              `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_SUBDOMAIN`,
            ),
          };
        }
        return data;
      case AuthStrategy.api_key:
        data = {
          API_KEY: this.configService.get<string>(
            `${provider.toUpperCase()}_${vertical.toUpperCase()}_${softwareMode.toUpperCase()}_API_KEY`,
          ),
        };
        if (needsSubdomain(provider, vertical)) {
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
        if (needsSubdomain(provider, vertical)) {
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

  async getCredentials(projectId: string, type: string) {
    const isCustomCred = await this.isCustomCredentials(projectId, type);
    const provider = extractProvider(type);
    const vertical = extractVertical(type);
    //TODO: extract sofwtaremode
    if (!vertical)
      throw new Error(`vertical not found for provider ${provider}`);
    const authStrategy = extractAuthMode(type);
    if (!authStrategy)
      throw new Error(`auth strategy not found for provider ${provider}`);

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
      return this.getEnvData(
        provider,
        vertical,
        authStrategy,
        SoftwareMode.cloud,
      );
    }
  }

  // Fetching all connection strategies for Project
  async getConnectionStrategiesForProject(projectId: string) {
    try {
      return await this.prisma.connection_strategies.findMany({
        where: {
          id_project: projectId,
        },
      });
    } catch (error) {
      throw new Error('Connection Strategies for projectID is not found!');
    }
  }

  // update connection strategy
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
      if (!cs) throw new Error('No connection strategies found !');
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

      for (let i = 0; i < attributes.length; i++) {
        const attribute_slug = attributes[i];
        const value = values[i];

        // Updating attributes' values
        const { id_cs_attribute } = await this.prisma.cs_attributes.findFirst({
          where: {
            id_cs_entity: id_cs_entity,
            attribute_slug: attribute_slug,
            data_type: 'string', //TODO
          },
        });
        const value_ = await this.prisma.cs_values.updateMany({
          where: {
            id_cs_attribute: id_cs_attribute,
          },
          data: {
            value: value,
          },
        });
      }
      return cs;
    } catch (error) {
      throw new Error('Update Failed');
    }
  }

  // Delete connection strategy
  async deleteConnectionStrategy(id_cs: string) {
    try {
      const cs = await this.prisma.connection_strategies.findFirst({
        where: {
          id_connection_strategy: id_cs,
        },
      });
      if (!cs) throw new Error('No connection strategies found !');

      const { id_cs_entity } = await this.prisma.cs_entities.findFirst({
        where: {
          id_connection_strategy: id_cs,
        },
      });

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
      throw new Error('Update Failed');
    }
  }
}
