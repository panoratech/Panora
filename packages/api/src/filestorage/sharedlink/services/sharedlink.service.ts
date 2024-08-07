import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedFilestorageSharedlinkOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class SharedLinkService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(SharedLinkService.name);
  }

  async getSharedlink(
    id_fs_shared_link: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestorageSharedlinkOutput> {
    try {
      const sharedlink = await this.prisma.fs_shared_links.findUnique({
        where: {
          id_fs_shared_link: id_fs_shared_link,
        },
      });

      // Fetch field mappings for the shared link
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: sharedlink.id_fs_shared_link,
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

      // Transform to UnifiedFilestorageSharedlinkOutput format
      const unifiedSharedLink: UnifiedFilestorageSharedlinkOutput = {
        id: sharedlink.id_fs_shared_link,
        url: sharedlink.url,
        download_url: sharedlink.download_url,
        folder_id: sharedlink.id_fs_folder,
        file_id: sharedlink.id_fs_file,
        scope: sharedlink.scope,
        password_protected: sharedlink.password_protected,
        password: sharedlink.password,
        field_mappings: field_mappings,
        created_at: sharedlink.created_at,
        modified_at: sharedlink.modified_at,
      };

      let res: UnifiedFilestorageSharedlinkOutput = unifiedSharedLink;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: sharedlink.id_fs_shared_link,
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
            type: 'filestorage.sharedlink.pull',
            method: 'GET',
            url: '/filestorage/sharedlink',
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

  async getSharedlinks(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedFilestorageSharedlinkOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_shared_links.findFirst({
          where: {
            id_connection: connection_id,
            id_fs_shared_link: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const sharedlinks = await this.prisma.fs_shared_links.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_fs_shared_link: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (sharedlinks.length === limit + 1) {
        next_cursor = Buffer.from(
          sharedlinks[sharedlinks.length - 1].id_fs_shared_link,
        ).toString('base64');
        sharedlinks.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedSharedLinks: UnifiedFilestorageSharedlinkOutput[] =
        await Promise.all(
          sharedlinks.map(async (sharedlink) => {
            // Fetch field mappings for the shared link
            const values = await this.prisma.value.findMany({
              where: {
                entity: {
                  ressource_owner_id: sharedlink.id_fs_shared_link,
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

            // Transform to UnifiedFilestorageSharedlinkOutput format
            return {
              id: sharedlink.id_fs_shared_link,
              url: sharedlink.url,
              download_url: sharedlink.download_url,
              folder_id: sharedlink.id_fs_folder,
              file_id: sharedlink.id_fs_file,
              scope: sharedlink.scope,
              password_protected: sharedlink.password_protected,
              password: sharedlink.password,
              field_mappings: field_mappings,
              created_at: sharedlink.created_at,
              modified_at: sharedlink.modified_at,
            };
          }),
        );

      let res: UnifiedFilestorageSharedlinkOutput[] = unifiedSharedLinks;

      if (remote_data) {
        const remote_array_data: UnifiedFilestorageSharedlinkOutput[] =
          await Promise.all(
            res.map(async (sharedlink) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: sharedlink.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...sharedlink, remote_data };
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
          type: 'filestorage.sharedlink.pull',
          method: 'GET',
          url: '/filestorage/sharedlinks',
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
