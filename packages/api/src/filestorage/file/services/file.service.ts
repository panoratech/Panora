import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedFileInput, UnifiedFileOutput } from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { CoreUnification } from '@@core/utils/services/core.service';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';

@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(FileService.name);
  }

  async addFile(
    unifiedFileData: UnifiedFileInput,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedFileOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.file',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedFileInput>({
          sourceObject: unifiedFileData,
          targetType: FileStorageObject.file,
          providerName: integrationId,
          vertical: 'filestorage',
          customFieldMappings: unifiedFileData.field_mappings
            ? customFieldMappings
            : [],
        });

      this.logger.log(
        'desunified object is ' + JSON.stringify(desunifiedObject),
      );

      const service = this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalFileOutput> = await service.addFile(
        desunifiedObject,
        linkedUserId,
      );

      const unifiedObject = (await this.coreUnification.unify<
        OriginalFileOutput[]
      >({
        sourceObject: [resp.data],
        targetType: FileStorageObject.file,
        providerName: integrationId,
        vertical: 'filestorage',
        customFieldMappings: customFieldMappings,
      })) as UnifiedFileOutput[];

      const source_file = resp.data;
      const target_file = unifiedObject[0];

      const existingFile = await this.prisma.fs_files.findFirst({
        where: {
          remote_id: target_file.remote_id,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_fs_file_id: string;

      if (existingFile) {
        const data: any = {
          name: target_file.name,
          type: target_file.type,
          file_url: target_file.file_url,
          mime_type: target_file.mime_type,
          size: target_file.size,
          folder_id: target_file.folder_id,
          permission_id: target_file.permission_id,
          modified_at: new Date(),
        };

        const res = await this.prisma.fs_files.update({
          where: {
            id_fs_file: existingFile.id_fs_file,
          },
          data: data,
        });

        unique_fs_file_id = res.id_fs_file;
      } else {
        const data: any = {
          id_fs_file: uuidv4(),
          name: target_file.name,
          type: target_file.type,
          file_url: target_file.file_url,
          mime_type: target_file.mime_type,
          size: target_file.size,
          folder_id: target_file.folder_id,
          permission_id: target_file.permission_id,
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_file.remote_id,
          remote_platform: integrationId,
        };

        const newFile = await this.prisma.fs_files.create({
          data: data,
        });

        unique_fs_file_id = newFile.id_fs_file;
      }

      if (target_file.field_mappings && target_file.field_mappings.length > 0) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_fs_file_id,
          },
        });

        for (const [slug, value] of Object.entries(
          target_file.field_mappings,
        )) {
          const attribute = await this.prisma.attribute.findFirst({
            where: {
              slug: slug,
              source: integrationId,
              id_consumer: linkedUserId,
            },
          });

          if (attribute) {
            await this.prisma.value.create({
              data: {
                id_value: uuidv4(),
                data: value || 'null',
                attribute: {
                  connect: {
                    id_attribute: attribute.id_attribute,
                  },
                },
                entity: {
                  connect: {
                    id_entity: entity.id_entity,
                  },
                },
              },
            });
          }
        }
      }

      await this.prisma.remote_data.upsert({
        where: {
          ressource_owner_id: unique_fs_file_id,
        },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_fs_file_id,
          format: 'json',
          data: JSON.stringify(source_file),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_file),
          created_at: new Date(),
        },
      });

      const result_file = await this.getFile(unique_fs_file_id, remote_data);

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'filestorage.file.created',
          method: 'POST',
          url: '/filestorage/files',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        result_file,
        'filestorage.file.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_file;
    } catch (error) {
      throw error;
    }
  }

  async getFile(
    id_fs_file: string,
    remote_data?: boolean,
  ): Promise<UnifiedFileOutput> {
    try {
      const file = await this.prisma.fs_files.findUnique({
        where: {
          id_fs_file: id_fs_file,
        },
      });

      // Fetch field mappings for the file
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: file.id_fs_file,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedFileOutput format
      const unifiedFile: UnifiedFileOutput = {
        id: file.id_fs_file,
        name: file.name,
        type: file.type,
        file_url: file.file_url,
        mime_type: file.mime_type,
        size: file.size,
        folder_id: file.folder_id,
        permission_id: file.permission_id,
        field_mappings: field_mappings,
        remote_id: file.remote_id,
        created_at: file.created_at,
        modified_at: file.modified_at,
      };

      let res: UnifiedFileOutput = unifiedFile;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: file.id_fs_file,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getFiles(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedFileOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_files.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_fs_file: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const files = await this.prisma.fs_files.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_fs_file: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (files.length === limit + 1) {
        next_cursor = Buffer.from(files[files.length - 1].id_fs_file).toString(
          'base64',
        );
        files.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedFiles: UnifiedFileOutput[] = await Promise.all(
        files.map(async (file) => {
          // Fetch field mappings for the file
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: file.id_fs_file,
              },
            },
            include: {
              attribute: true,
            },
          });

          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedFileOutput format
          return {
            id: file.id_fs_file,
            name: file.name,
            type: file.type,
            file_url: file.file_url,
            mime_type: file.mime_type,
            size: file.size,
            folder_id: file.folder_id,
            permission_id: file.permission_id,
            field_mappings: field_mappings,
            remote_id: file.remote_id,
            created_at: file.created_at,
            modified_at: file.modified_at,
          };
        }),
      );

      let res: UnifiedFileOutput[] = unifiedFiles;

      if (remote_data) {
        const remote_array_data: UnifiedFileOutput[] = await Promise.all(
          res.map(async (file) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: file.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...file, remote_data };
          }),
        );

        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'filestorage.file.pull',
          method: 'GET',
          url: '/filestorage/files',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateFile(
    id: string,
    updateFileData: Partial<UnifiedFileInput>,
  ): Promise<UnifiedFileOutput> {
    try {
    } catch (error) {}
    return;
  }
}
