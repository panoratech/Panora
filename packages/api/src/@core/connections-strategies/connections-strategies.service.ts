import { PrismaService } from '@@core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
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
  constructor(private prisma: PrismaService) {}

  async isCustomCredentials(projectId: string, type: string) {
    const res = await this.prisma.connection_strategies.findFirst({
      where: {
        id_project: projectId,
        type: type,
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
    const values: string[] = [];
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
      values.push(value_.value);
    }
    return values;
  }

  //TODO: update connection strategy
}
