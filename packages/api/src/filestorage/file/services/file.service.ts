import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedFilestorageFileInput,
  UnifiedFilestorageFileOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(FileService.name);
  }

  async addFile(
    unifiedFileData: UnifiedFilestorageFileInput,
    connection_id: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestorageFileOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.file',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedFilestorageFileInput>({
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
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedFilestorageFileOutput[];

      const source_file = resp.data;
      const target_file = unifiedObject[0];

      const unique_fs_file_id = await this.saveOrUpdateFile(
        target_file,
        connection_id,
      );

      await this.ingestService.processFieldMappings(
        target_file.field_mappings,
        unique_fs_file_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_fs_file_id,
        source_file,
      );

      const result_file = await this.getFile(
        unique_fs_file_id,
        undefined,
        undefined,
        connection_id,
        projectId,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: projectId,
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
      await this.webhook.dispatchWebhook(
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

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async saveOrUpdateFile(
    file: UnifiedFilestorageFileOutput,
    connection_id: string,
  ): Promise<string> {
    const existingFile = await this.prisma.fs_files.findFirst({
      where: { remote_id: file.remote_id, id_connection: connection_id },
    });

    const data: any = {
      name: file.name,
      file_url: file.file_url,
      mime_type: file.mime_type,
      size: file.size,
      folder_id: file.folder_id,
      permission_ids: file.permissions as string[],
      modified_at: new Date(),
    };

    if (existingFile) {
      const res = await this.prisma.fs_files.update({
        where: { id_fs_file: existingFile.id_fs_file },
        data: data,
      });
      return res.id_fs_file;
    } else {
      data.created_at = new Date();
      data.remote_id = file.remote_id;
      data.id_connection = connection_id;
      data.id_fs_file = uuidv4();

      const newFile = await this.prisma.fs_files.create({ data: data });
      return newFile.id_fs_file;
    }
  }

  async getFile(
    id_fs_file: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestorageFileOutput> {
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
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      let permissions;
      if (file.id_fs_permissions?.length > 0) {
        const perms = await this.prisma.fs_permissions.findMany({
          where: {
            id_fs_permission: {
              in: file.id_fs_permissions,
            },
          },
        });
        permissions = perms;
      }

      const sharedLink = await this.prisma.fs_shared_links.findFirst({
        where: {
          id_fs_file: file.id_fs_file,
        },
      });
      // Transform to UnifiedFilestorageFileOutput format
      const unifiedFile: UnifiedFilestorageFileOutput = {
        id: file.id_fs_file,
        name: file.name,
        file_url: file.file_url,
        mime_type: file.mime_type,
        size: String(file.size),
        folder_id: file.id_fs_folder,
        drive_id: file.id_fs_drive,
        permissions: permissions || null,
        shared_link: sharedLink || null,
        field_mappings: field_mappings,
        remote_id: file.remote_id,
        created_at: file.created_at,
        modified_at: file.modified_at,
        remote_created_at: file.remote_created_at,
        remote_modified_at: file.remote_modified_at,
        remote_was_deleted: file.remote_was_deleted,
      };

      let res: UnifiedFilestorageFileOutput = unifiedFile;
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
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connectionId,
            id_project: projectId,
            id_event: uuidv4(),
            status: 'success',
            type: 'filestorage.file.pull',
            method: 'GET',
            url: '/filestorage/file',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async getFiles(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedFilestorageFileOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_files.findFirst({
          where: {
            id_connection: connection_id,
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
          id_connection: connection_id,
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

      const unifiedFiles: UnifiedFilestorageFileOutput[] = await Promise.all(
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
          // Convert the map to an object
          const field_mappings = Object.fromEntries(fieldMappingsMap);

          let permissions;
          if (file.id_fs_permissions?.length > 0) {
            const perms = await this.prisma.fs_permissions.findMany({
              where: {
                id_fs_permission: {
                  in: file.id_fs_permissions,
                },
              },
            });
            permissions = perms;
          }

          const sharedLink = await this.prisma.fs_shared_links.findFirst({
            where: {
              id_fs_file: file.id_fs_file,
            },
          });

          // Transform to UnifiedFilestorageFileOutput format
          return {
            id: file.id_fs_file,
            name: file.name,
            file_url: file.file_url,
            mime_type: file.mime_type,
            size: String(file.size),
            folder_id: file.id_fs_folder,
            drive_id: file.id_fs_drive,
            permissions: permissions || null,
            shared_link: sharedLink || null,
            field_mappings: field_mappings,
            remote_id: file.remote_id,
            created_at: file.created_at,
            modified_at: file.modified_at,
            remote_created_at: file.remote_created_at,
            remote_modified_at: file.remote_modified_at,
            remote_was_deleted: file.remote_was_deleted,
          };
        }),
      );

      let res: UnifiedFilestorageFileOutput[] = unifiedFiles;

      if (remote_data) {
        const remote_array_data: UnifiedFilestorageFileOutput[] =
          await Promise.all(
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

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
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
  /*async getCountFiles(connection_id: string): Promise<number> {
    try {
      const fileCount = await this.prisma.fs_files.count({
        where: {
          id_connection: connection_id,
        },
      });
      return fileCount;
    } catch (error) {
      throw error;
    }
  }*/
}
