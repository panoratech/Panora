import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import {
  DefineTargetFieldDto,
  MapFieldToProviderDto,
} from './dto/create-custom-field.dto';
import { v4 as uuidv4 } from 'uuid';
import { customPropertiesUrls, getProviderVertical } from '../utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { CrmObject } from '@crm/@types';
import { EncryptionService } from '@@core/encryption/encryption.service';

@Injectable()
export class FieldMappingService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
  ) {
    this.logger.setContext(FieldMappingService.name);
  }

  async getAttributes() {
    try {
      return await this.prisma.attribute.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getValues() {
    try {
      return await this.prisma.value.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
    return await this.prisma.value.findMany();
  }

  async getEntities() {
    try {
      return await this.prisma.entity.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getCustomFieldMappings(
    integrationId: string,
    linkedUserId: string,
    standard_object: string,
  ) {
    try {
      return await this.prisma.attribute.findMany({
        where: {
          source: integrationId,
          id_consumer: linkedUserId,
          ressource_owner_type: standard_object,
        },
        select: {
          remote_id: true,
          slug: true,
        },
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async defineTargetField(dto: DefineTargetFieldDto) {
    // Create a new attribute in your system representing the target field
    //const id_entity = await this.getEntityId(dto.object_type_owner);
    //this.logger.log('id entity is ' + id_entity);
    try {
      const attribute = await this.prisma.attribute.create({
        data: {
          id_attribute: uuidv4(),
          ressource_owner_type: dto.object_type_owner as string,
          slug: dto.name,
          description: dto.description,
          data_type: dto.data_type,
          status: 'defined', // [defined | mapped]
          // below is done in step 2
          remote_id: '',
          source: '',
          //id_entity: id_entity,
          scope: 'user', // [user | org] wide
        },
      });

      return attribute;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async mapFieldToProvider(dto: MapFieldToProviderDto) {
    try {
      const updatedAttribute = await this.prisma.attribute.update({
        where: {
          id_attribute: dto.attributeId.trim(),
        },
        data: {
          remote_id: dto.source_custom_field_id,
          source: dto.source_provider,
          id_consumer: dto.linked_user_id.trim(),
          status: 'mapped',
        },
      });

      return updatedAttribute;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getCustomProperties(linkedUserId: string, providerId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: providerId.toLowerCase(),
        },
      });

      const resp = await axios.get(
        customPropertiesUrls[getProviderVertical(providerId)][providerId],
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: resp.data,
        message: `${providerId} contact properties retrieved`,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        providerId,
        CrmObject.contact,
        ActionType.GET,
      );
    }
  }
}
