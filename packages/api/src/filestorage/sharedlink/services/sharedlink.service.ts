import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedSharedLinkInput,
  UnifiedSharedLinkOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { CoreUnification } from '@@core/utils/services/core.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';
import { WebhookService } from '@@core/webhook/webhook.service';
import { ServiceRegistry } from './registry.service';
import { FileStorageObject } from '@filestorage/@lib/@types';

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

  async addSharedlink(
    unifiedSharedlinkData: UnifiedSharedLinkInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedSharedLinkOutput> {
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
          'filestorage.sharedlink',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedSharedLinkInput>({
          sourceObject: unifiedSharedlinkData,
          targetType: FileStorageObject.sharedlink,
          providerName: integrationId,
          vertical: 'filestorage',
          customFieldMappings: unifiedSharedlinkData.field_mappings
            ? customFieldMappings
            : [],
        });

      this.logger.log(
        'desunified object is ' + JSON.stringify(desunifiedObject),
      );

      const service = this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalSharedLinkOutput> =
        await service.addSharedLink(desunifiedObject, linkedUserId);

      const unifiedObject = (await this.coreUnification.unify<
        OriginalSharedLinkOutput[]
      >({
        sourceObject: [resp.data],
        targetType: FileStorageObject.sharedlink,
        providerName: integrationId,
        vertical: 'filestorage',
        customFieldMappings: customFieldMappings,
      })) as UnifiedSharedLinkOutput[];

      const source_sharedlink = resp.data;
      const target_sharedlink = unifiedObject[0];

      const existingSharedLink = await this.prisma.fs_shared_links.findFirst({
        where: {
          remote_id: target_sharedlink.remote_id,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_fs_shared_link_id: string;

      if (existingSharedLink) {
        const data: any = {
          url: target_sharedlink.url,
          download_url: target_sharedlink.download_url,
          id_fs_folder: target_sharedlink.folder_id,
          id_fs_file: target_sharedlink.file_id,
          scope: target_sharedlink.scope,
          password_protected: target_sharedlink.password_protected,
          password: target_sharedlink.password,
          modified_at: new Date(),
        };

        const res = await this.prisma.fs_shared_links.update({
          where: {
            id_fs_shared_link: existingSharedLink.id_fs_shared_link,
          },
          data: data,
        });

        unique_fs_shared_link_id = res.id_fs_shared_link;
      } else {
        const data: any = {
          id_fs_shared_link: uuidv4(),
          url: target_sharedlink.url,
          download_url: target_sharedlink.download_url,
          id_fs_folder: target_sharedlink.folder_id,
          id_fs_file: target_sharedlink.file_id,
          scope: target_sharedlink.scope,
          password_protected: target_sharedlink.password_protected,
          password: target_sharedlink.password,
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_sharedlink.remote_id,
          remote_platform: integrationId,
        };

        const newSharedLink = await this.prisma.fs_shared_links.create({
          data: data,
        });

        unique_fs_shared_link_id = newSharedLink.id_fs_shared_link;
      }

      if (
        target_sharedlink.field_mappings &&
        target_sharedlink.field_mappings.length > 0
      ) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_fs_shared_link_id,
          },
        });

        for (const [slug, value] of Object.entries(
          target_sharedlink.field_mappings,
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
          ressource_owner_id: unique_fs_shared_link_id,
        },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_fs_shared_link_id,
          format: 'json',
          data: JSON.stringify(source_sharedlink),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_sharedlink),
          created_at: new Date(),
        },
      });

      const result_sharedlink = await this.getSharedlink(
        unique_fs_shared_link_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'filestorage.sharedlink.created',
          method: 'POST',
          url: '/filestorage/sharedlinks',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        result_sharedlink,
        'filestorage.sharedlink.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_sharedlink;
    } catch (error) {
      throw error;
    }
  }

  async getSharedlink(
    id_fs_shared_link: string,
    remote_data?: boolean,
  ): Promise<UnifiedSharedLinkOutput> {
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedSharedLinkOutput format
      const unifiedSharedLink: UnifiedSharedLinkOutput = {
        id: sharedlink.id_fs_shared_link,
        url: sharedlink.url,
        download_url: sharedlink.download_url,
        folder_id: sharedlink.id_fs_folder,
        file_id: sharedlink.id_fs_file,
        scope: sharedlink.scope,
        password_protected: sharedlink.password_protected,
        password: sharedlink.password,
        field_mappings: field_mappings,
        remote_id: sharedlink.remote_id,
        created_at: sharedlink.created_at,
        modified_at: sharedlink.modified_at,
      };

      let res: UnifiedSharedLinkOutput = unifiedSharedLink;
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

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getSharedlinks(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedSharedLinkOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_shared_links.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
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
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
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

      const unifiedSharedLinks: UnifiedSharedLinkOutput[] = await Promise.all(
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

          // Transform to UnifiedSharedLinkOutput format
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
            remote_id: sharedlink.remote_id,
            created_at: sharedlink.created_at,
            modified_at: sharedlink.modified_at,
          };
        }),
      );

      let res: UnifiedSharedLinkOutput[] = unifiedSharedLinks;

      if (remote_data) {
        const remote_array_data: UnifiedSharedLinkOutput[] = await Promise.all(
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

      const event = await this.prisma.events.create({
        data: {
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

  async updateSharedLink(
    id: string,
    updateSharedLinkData: Partial<UnifiedSharedLinkInput>,
  ): Promise<UnifiedSharedLinkOutput> {
    try {
    } catch (error) {}
    return;
  }
}
