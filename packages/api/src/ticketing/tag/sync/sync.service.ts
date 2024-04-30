import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTagOutput } from '../types/model.unified';
import { ITagService } from '../types';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ticketing';
import { tcg_tags as TicketingTag } from '@prisma/client';
import { TICKETING_PROVIDERS } from '@panora/shared';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      //await this.syncTags();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('0 1 * * *')
  //function used by sync worker which populate our tcg_tags table
  //its role is to fetch all tags from providers 3rd parties and save the info inside our db
  async syncTags(user_id?: string) {
    try {
      this.logger.log(`Syncing tags....`);
      const users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (const project of projects) {
            const id_project = project.id_project;
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: {
                id_project: id_project,
              },
            });
            linkedUsers.map(async (linkedUser) => {
              try {
                const providers = TICKETING_PROVIDERS;
                for (const provider of providers) {
                  try {
                    //call the sync comments for every ticket of the linkedUser (a comment is tied to a ticket)
                    const tickets = await this.prisma.tcg_tickets.findMany({
                      where: {
                        remote_platform: provider,
                        id_linked_user: linkedUser.id_linked_user,
                      },
                    });
                    for (const ticket of tickets) {
                      await this.syncTagsForLinkedUser(
                        provider,
                        linkedUser.id_linked_user,
                        id_project,
                        ticket.id_tcg_ticket,
                      );
                    }
                  } catch (error) {
                    handleServiceError(error, this.logger);
                  }
                }
              } catch (error) {
                handleServiceError(error, this.logger);
              }
            });
          }
        }
      }
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncTagsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
    id_ticket: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} tags for linkedTag ${linkedUserId}`,
      );
      // check if linkedTag has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ticketing',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping tags syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.tag',
        );

      const service: ITagService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalTagOutput[]> = await service.syncTags(
        linkedUserId,
        id_ticket,
      );

      const sourceObject: OriginalTagOutput[] = resp.data;

      //TODO; do it in every file
      if (!sourceObject || sourceObject.length == 0) {
        this.logger.warn('Source object is empty, returning :) ....');
        return;
      }

      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalTagOutput[]>({
        sourceObject,
        targetType: TicketingObject.tag,
        providerName: integrationId,
        vertical: 'ticketing',
        customFieldMappings,
      })) as UnifiedTagOutput[];

      //TODO: exceptionally we use the unifiedObject as we might need to get the fake remote ids from Zendesk store in id field
      const tagIds = unifiedObject.map((tag) =>
        'id' in tag ? String(tag.id) : undefined,
      );

      //insert the data in the DB with the fieldMappings (value table)
      const tag_data = await this.saveTagsInDb(
        linkedUserId,
        unifiedObject,
        tagIds,
        integrationId,
        id_ticket,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.tag.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        tag_data,
        'ticketing.tag.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveTagsInDb(
    linkedUserId: string,
    tags: UnifiedTagOutput[],
    originIds: string[],
    originSource: string,
    id_ticket: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingTag[]> {
    try {
      let tags_results: TicketingTag[] = [];
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          return;
        }

        const existingTag = await this.prisma.tcg_tags.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_ticketing_tag_id: string;

        if (existingTag) {
          // Update the existing ticket
          const res = await this.prisma.tcg_tags.update({
            where: {
              id_tcg_tag: existingTag.id_tcg_tag,
            },
            data: {
              name: existingTag.name,
              modified_at: new Date(),
            },
          });
          unique_ticketing_tag_id = res.id_tcg_tag;
          tags_results = [...tags_results, res];
        } else {
          // Create a new tag
          this.logger.log('not existing tag ' + tag.name);

          const data = {
            id_tcg_tag: uuidv4(),
            name: tag.name,
            created_at: new Date(),
            modified_at: new Date(),
            id_tcg_ticket: id_ticket,
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };
          const res = await this.prisma.tcg_tags.create({
            data: data,
          });
          tags_results = [...tags_results, res];
          unique_ticketing_tag_id = res.id_tcg_tag;
        }

        // check duplicate or existing values
        if (tag.field_mappings && tag.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ticketing_tag_id,
            },
          });

          for (const [slug, value] of Object.entries(tag.field_mappings)) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: slug,
                source: originSource,
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

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ticketing_tag_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_tag_id,
            format: 'json',
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return tags_results;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
