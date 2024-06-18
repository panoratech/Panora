import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import {
  CustomFieldCreateDto,
  DefineTargetFieldDto,
  MapFieldToProviderDto,
} from './dto/create-custom-field.dto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import {
  ActionType,
  CustomFieldsError,
  format3rdPartyError,
  throwTypedError,
} from '@@core/utils/errors';
import { CrmObject } from '@crm/@lib/@types';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { CONNECTORS_METADATA } from '@panora/shared';

@Injectable()
export class FieldMappingService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
  ) {
    this.logger.setContext(FieldMappingService.name);
  }

  async getAttributes(projectId: string) {
    try {
      return await this.prisma.attribute.findMany({
        where: {
          id_project: projectId,
        },
      });
    } catch (error) {
      throwTypedError(
        new CustomFieldsError({
          name: 'GET_ATTRIBUTES_ERROR',
          message: 'FieldMappingService.getAttributes() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async getValues() {
    try {
      return await this.prisma.value.findMany();
    } catch (error) {
      throwTypedError(
        new CustomFieldsError({
          name: 'GET_VALUES_ERROR',
          message: 'FieldMappingService.getValues() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async getEntities() {
    try {
      return await this.prisma.entity.findMany();
    } catch (error) {
      throwTypedError(
        new CustomFieldsError({
          name: 'GET_ENTITIES_ERROR',
          message: 'FieldMappingService.getEntities() call failed',
          cause: error,
        }),
        this.logger,
      );
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
      throwTypedError(
        new CustomFieldsError({
          name: 'GET_CUSTOM_FIELDS_ERROR',
          message: 'FieldMappingService.getCustomFieldMappings() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async defineTargetField(dto: DefineTargetFieldDto, projectId: string) {
    // Create a new attribute in your system representing the target field
    //const id_entity = await this.getEntityId(dto.object_type_owner);
    //this.logger.log('id entity is ' + id_entity);
    try {
      const attribute = await this.prisma.attribute.create({
        data: {
          id_attribute: uuidv4(),
          id_project: projectId,
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
      throwTypedError(
        new CustomFieldsError({
          name: 'CREATE_DEFINE_FIELD_ERROR',
          message: 'FieldMappingService.defineTargetField() call failed',
          cause: error,
        }),
        this.logger,
      );
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
      throwTypedError(
        new CustomFieldsError({
          name: 'CREATE_MAP_FIELD_ERROR',
          message: 'FieldMappingService.mapFieldToProvider() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async createCustomField(dto: CustomFieldCreateDto, projectId: string) {
    try {
      const attribute = await this.prisma.attribute.create({
        data: {
          id_attribute: uuidv4(),
          id_project: projectId,
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
      const updatedAttribute = await this.prisma.attribute.update({
        where: {
          id_attribute: attribute.id_attribute.trim(),
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
      throwTypedError(
        new CustomFieldsError({
          name: 'CREATE_CUSTOM_FIELD_ERROR',
          message: 'FieldMappingService.createCustomField() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async getCustomProperties(
    linkedUserId: string,
    providerId: string,
    vertical: string,
  ) {
    try {
      this.logger.log(
        'data to test is => ' +
          JSON.stringify({
            providerId,
            vertical,
          }),
      );
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: providerId.toLowerCase(),
          vertical: vertical.toLowerCase(),
        },
      });
      const provider = CONNECTORS_METADATA[vertical][providerId.toLowerCase()];
      if (!provider.urls.apiUrl || !provider.urls.customPropertiesUrl)
        throw new Error('proivder urls are invalid');

      const resp = await axios.get(provider.urls.customPropertiesUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log('properties are ' + JSON.stringify(resp.data));
      return {
        data: resp.data,
        message: `${providerId} contact properties retrieved`,
        statusCode: 200,
      };
    } catch (error) {
      throwTypedError(
        new CustomFieldsError({
          name: 'GET_3RD_PARTY_REMOTE_PROPERTIES',
          message: `FieldMappingService.getCustomProperties() call failed ---> ${format3rdPartyError(
            providerId,
            CrmObject.contact,
            ActionType.GET,
          )}`,
          cause: error,
        }),
        this.logger,
      );
    }
  }
}
