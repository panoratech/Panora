import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedFilestorageFolderInput,
  UnifiedFilestorageFolderOutput,
} from '../types/model.unified';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { OriginalFolderOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class FolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(FolderService.name);
  }

  async addFolder(
    unifiedFolderData: UnifiedFilestorageFolderInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestorageFolderOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.folder',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedFilestorageFolderInput>({
          sourceObject: unifiedFolderData,
          targetType: FileStorageObject.folder,
          providerName: integrationId,
          vertical: 'filestorage',
          customFieldMappings: unifiedFolderData.field_mappings
            ? customFieldMappings
            : [],
        });

      this.logger.log(
        'desunified object is ' + JSON.stringify(desunifiedObject),
      );

      const service = this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalFolderOutput> = await service.addFolder(
        desunifiedObject,
        linkedUserId,
      );

      const unifiedObject = (await this.coreUnification.unify<
        OriginalFolderOutput[]
      >({
        sourceObject: [resp.data],
        targetType: FileStorageObject.folder,
        providerName: integrationId,
        vertical: 'filestorage',
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedFilestorageFolderOutput[];

      const source_folder = resp.data;
      const target_folder = unifiedObject[0];

      const unique_fs_folder_id = await this.saveOrUpdateFolder(
        target_folder,
        connection_id,
      );

      await this.ingestService.processFieldMappings(
        target_folder.field_mappings,
        unique_fs_folder_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_fs_folder_id,
        source_folder,
      );

      const result_folder = await this.getFolder(
        unique_fs_folder_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: status_resp,
          type: 'filestorage.folder.created',
          method: 'POST',
          url: '/filestorage/folders',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_folder,
        'filestorage.folder.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_folder;
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

  async saveOrUpdateFolder(
    folder: UnifiedFilestorageFolderOutput,
    connection_id: string,
  ): Promise<string> {
    const existingFolder = await this.prisma.fs_folders.findFirst({
      where: { remote_id: folder.remote_id, id_connection: connection_id },
    });

    const data: any = {
      folder_url: folder.folder_url,
      size: folder.size,
      name: folder.name,
      description: folder.description,
      parent_folder: folder.parent_folder_id,
      id_fs_drive: folder.drive_id,
      id_fs_permissions: folder.permissions as string[],
      modified_at: new Date(),
    };

    if (existingFolder) {
      const res = await this.prisma.fs_folders.update({
        where: { id_fs_folder: existingFolder.id_fs_folder },
        data: data,
      });
      return res.id_fs_folder;
    } else {
      data.created_at = new Date();
      data.remote_id = folder.remote_id;
      data.id_connection = connection_id;
      data.id_fs_folder = uuidv4();

      const newFolder = await this.prisma.fs_folders.create({ data: data });
      return newFolder.id_fs_folder;
    }
  }

  async getFolder(
    id_fs_folder: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestorageFolderOutput> {
    try {
      const folder = await this.prisma.fs_folders.findUnique({
        where: {
          id_fs_folder: id_fs_folder,
        },
      });

      // Fetch field mappings for the folder
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: folder.id_fs_folder,
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
      if (folder.id_fs_permissions?.length > 0) {
        const perms = await this.prisma.fs_permissions.findMany({
          where: {
            id_fs_permission: {
              in: folder.id_fs_permissions,
            },
          },
        });
        permissions = perms;
      }

      const sharedLink = await this.prisma.fs_shared_links.findFirst({
        where: {
          id_fs_folder: folder.id_fs_folder,
        },
      });

      // Transform to UnifiedFilestorageFolderOutput format
      const unifiedFolder: UnifiedFilestorageFolderOutput = {
        id: folder.id_fs_folder,
        folder_url: folder.folder_url,
        size: String(folder.size),
        name: folder.name,
        description: folder.description,
        parent_folder_id: folder.parent_folder,
        drive_id: folder.id_fs_drive,
        permissions: permissions || null,
        shared_link: sharedLink || null,
        field_mappings: field_mappings,
        remote_id: folder.remote_id,
        created_at: folder.created_at,
        modified_at: folder.modified_at,
        remote_created_at: folder.remote_created_at,
        remote_modified_at: folder.remote_modified_at,
        remote_was_deleted: folder.remote_was_deleted,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: folder.id_fs_folder,
          },
        });
        const remote_data = JSON.parse(resp.data);
        unifiedFolder.remote_data = remote_data;
      }
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connectionId,
            id_project: projectId,
            id_event: uuidv4(),
            status: 'success',
            type: 'filestorage.folder.pull',
            method: 'GET',
            url: '/filestorage/folder',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }
      return unifiedFolder;
    } catch (error) {
      throw error;
    }
  }

  async getFolders(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedFilestorageFolderOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_folders.findFirst({
          where: {
            id_connection: connection_id,
            id_fs_folder: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const folders = await this.prisma.fs_folders.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_fs_folder: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (folders.length === limit + 1) {
        next_cursor = Buffer.from(
          folders[folders.length - 1].id_fs_folder,
        ).toString('base64');
        folders.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedFolders: UnifiedFilestorageFolderOutput[] =
        await Promise.all(
          folders.map(async (folder) => {
            // Fetch field mappings for the folder
            const values = await this.prisma.value.findMany({
              where: {
                entity: {
                  ressource_owner_id: folder.id_fs_folder,
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

            let permissions;
            if (folder.id_fs_permissions?.length > 0) {
              const perms = await this.prisma.fs_permissions.findMany({
                where: {
                  id_fs_permission: {
                    in: folder.id_fs_permissions,
                  },
                },
              });
              permissions = perms;
            }

            const sharedLink = await this.prisma.fs_shared_links.findFirst({
              where: {
                id_fs_folder: folder.id_fs_folder,
              },
            });

            // Transform to UnifiedFilestorageFolderOutput format
            return {
              id: folder.id_fs_folder,
              folder_url: folder.folder_url,
              size: String(folder.size),
              name: folder.name,
              description: folder.description,
              parent_folder_id: folder.parent_folder,
              drive_id: folder.id_fs_drive,
              permissions: permissions || null,
              shared_link: sharedLink || null,
              field_mappings: field_mappings,
              remote_id: folder.remote_id,
              created_at: folder.created_at,
              modified_at: folder.modified_at,
              remote_created_at: folder.remote_created_at,
              remote_modified_at: folder.remote_modified_at,
              remote_was_deleted: folder.remote_was_deleted,
            };
          }),
        );

      let res: UnifiedFilestorageFolderOutput[] = unifiedFolders;

      if (remote_data) {
        const remote_array_data: UnifiedFilestorageFolderOutput[] =
          await Promise.all(
            res.map(async (folder) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: folder.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...folder, remote_data };
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
          type: 'filestorage.folder.pull',
          method: 'GET',
          url: '/filestorage/folders',
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
}
