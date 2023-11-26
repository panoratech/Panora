import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import {
  DefineTargetFieldDto,
  MapFieldToProviderDto,
} from './dto/create-custom-field.dto';
import { v4 as uuidv4 } from 'uuid';
import { StandardObject } from '../utils/types';

@Injectable()
export class FieldMappingService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(FieldMappingService.name);
  }

  /* UTILS */
  // create a set of entities inside our db and save their entity id
  async addStandardObjectEntity(standardObjectName: string) {
    const entity = await this.prisma.entity.create({
      data: {
        id_entity: uuidv4(),
        ressource_owner_id: standardObjectName,
      },
    });
  }

  async getAttributes() {
    return await this.prisma.attribute.findMany();
  }

  async getValues() {
    return await this.prisma.value.findMany();
  }

  // and then retrieve them by their name
  async getEntityId(standardObject: StandardObject): Promise<string> {
    const res = await this.prisma.entity.findFirst({
      where: {
        ressource_owner_id: standardObject as string,
      },
    });
    return res.id_entity;
  }

  async defineTargetField(dto: DefineTargetFieldDto) {
    // Create a new attribute in your system representing the target field
    const id_entity = await this.getEntityId(dto.object_type_owner);
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
        id_entity: id_entity,
        scope: 'user', // [user | org] wide
        id_consumer: '',
      },
    });

    return attribute;
  }

  async mapFieldToProvider(dto: MapFieldToProviderDto) {
    // todo: include a value inside value table as mapping is done here
    const updatedAttribute = await this.prisma.attribute.update({
      where: {
        id_attribute: dto.attributeId,
      },
      data: {
        remote_id: dto.source_custom_field_id,
        source: dto.source_provider,
        id_consumer: dto.linked_user_id,
        status: 'mapped',
      },
    });

    //insert inside the table value

    const valueInserted = await this.prisma.value.create({
      data: {
        id_value: uuidv4(),
        data: dto.data,
        id_entity: updatedAttribute.id_entity,
        id_attribute: dto.attributeId,
      },
    });

    return updatedAttribute;
  }
}
