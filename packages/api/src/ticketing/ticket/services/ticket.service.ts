import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { v4 as uuidv4 } from 'uuid';
import { ITicketService } from '../types';
import {
  UnifiedTicketingTicketInput,
  UnifiedTicketingTicketOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(TicketService.name);
  }

  async addTicket(
    unifiedTicketData: UnifiedTicketingTicketInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingTicketOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      await this.validateAccountId(unifiedTicketData.account_id);
      await this.validateContactId(unifiedTicketData.contact_id);
      await this.validateAssignees(unifiedTicketData.assigned_to);
      unifiedTicketData.attachments = await this.processAttachments(
        unifiedTicketData.attachments,
        connection_id,
        linkedUserId,
        integrationId,
      );

      // Retrieve custom field mappings
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.ticket',
        );
      //desunify the data according to the target obj wanted
      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedTicketingTicketInput>({
          sourceObject: unifiedTicketData,
          targetType: TicketingObject.ticket,
          providerName: integrationId,
          vertical: 'ticketing',
          connectionId: connection_id,
          customFieldMappings: unifiedTicketData.field_mappings
            ? customFieldMappings
            : [],
        });

      this.logger.log(
        'ticket desunified is ' + JSON.stringify(desunifiedObject),
      );

      const service: ITicketService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalTicketOutput> = await service.addTicket(
        desunifiedObject,
        linkedUserId,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalTicketOutput[]
      >({
        sourceObject: [resp.data],
        targetType: TicketingObject.ticket,
        providerName: integrationId,
        vertical: 'ticketing',
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedTicketingTicketOutput[];

      // add the ticket inside our db
      const source_ticket = resp.data;
      const target_ticket = unifiedObject[0];

      const unique_ticketing_ticket_id = await this.saveOrUpdateTicket(
        target_ticket,
        connection_id,
      );

      await this.ingestService.processFieldMappings(
        target_ticket.field_mappings,
        unique_ticketing_ticket_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_ticketing_ticket_id,
        source_ticket,
      );

      const result_ticket = await this.getTicket(
        unique_ticketing_ticket_id,
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
          type: 'ticketing.ticket.push', //sync, push or pull
          method: 'PUSH',
          url: '/ticketing/tickets',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_ticket,
        'ticketing.ticket.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_ticket;
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

  async validateAccountId(accountId?: string) {
    if (accountId) {
      const account = await this.prisma.tcg_accounts.findUnique({
        where: { id_tcg_account: accountId },
      });
      if (!account)
        throw new ReferenceError(
          'You inserted an account_id which does not exist',
        );
    }
  }

  async validateContactId(contactId?: string) {
    if (contactId) {
      const contact = await this.prisma.tcg_contacts.findUnique({
        where: { id_tcg_contact: contactId },
      });
      if (!contact)
        throw new ReferenceError(
          'You inserted a contact_id which does not exist',
        );
    }
  }

  async validateAssignees(assignees?: string[]) {
    if (assignees && assignees.length > 0) {
      await Promise.all(
        assignees.map(async (assignee) => {
          const user = await this.prisma.tcg_users.findUnique({
            where: { id_tcg_user: assignee },
          });
          if (!user)
            throw new ReferenceError(
              'You inserted an assignee which does not exist',
            );
        }),
      );
    }
  }

  async processAttachments(
    attachments: any[],
    connection_id: string,
    linkedUserId: string,
    integrationId: string,
  ): Promise<string[]> {
    if (attachments && attachments.length > 0) {
      if (typeof attachments[0] === 'string') {
        await Promise.all(
          attachments.map(async (uuid: string) => {
            const attachment = await this.prisma.tcg_attachments.findUnique({
              where: { id_tcg_attachment: uuid },
            });
            if (!attachment)
              throw new ReferenceError(
                'You inserted an attachment_id which does not exist',
              );
          }),
        );
        return attachments;
      } else {
        const attchms_res = await this.registry
          .getService('ticketing', 'attachment')
          .saveToDb(
            connection_id,
            linkedUserId,
            attachments,
            integrationId,
            [],
          );
        return attchms_res.map((att) => att.id_tcg_attachment);
      }
    }
    return [];
  }

  async saveOrUpdateTicket(
    ticket: UnifiedTicketingTicketOutput,
    connection_id: string,
  ): Promise<string> {
    const existingTicket = await this.prisma.tcg_tickets.findFirst({
      where: { remote_id: ticket.remote_id, id_connection: connection_id },
    });

    const data: any = {
      id_tcg_ticket: uuidv4(),
      modified_at: new Date(),
      name: ticket.name,
      status: ticket.status,
      description: ticket.description,
      ticket_type: ticket.type,
      tags: ticket.tags,
      due_date: ticket.due_date,
      collections: ticket.collections,
      priority: ticket.priority,
      completed_at: ticket.completed_at,
      assigned_to: ticket.assigned_to,
      id_linked_user: connection_id, //todo remove
    };

    if (existingTicket) {
      const res = await this.prisma.tcg_tickets.update({
        where: { id_tcg_ticket: existingTicket.id_tcg_ticket },
        data: data,
      });
      return res.id_tcg_ticket;
    } else {
      data.created_at = new Date();
      data.remote_id = ticket.remote_id;
      data.id_connection = connection_id;

      const res = await this.prisma.tcg_tickets.create({ data: data });
      return res.id_tcg_ticket;
    }
  }

  async getTicket(
    id_ticketing_ticket: string,
    linkedUserId: string,
    integrationId: string,
    connection_id: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingTicketOutput> {
    try {
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticketing_ticket,
        },
      });

      // Fetch field mappings for the ticket
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: ticket.id_tcg_ticket,
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

      let tagsArray;
      if (ticket.tags) {
        const fetchedTags = await Promise.all(
          ticket.tags.map(async (tagUuid) => {
            const tag = await this.prisma.tcg_tags.findUnique({
              where: {
                id_tcg_tag: tagUuid,
              },
            });
            return tag;
          }),
        );
        tagsArray = await Promise.all(fetchedTags);
      }

      let collectionsArray;
      if (ticket.collections) {
        const fetchedCollections = await Promise.all(
          ticket.collections.map(async (collUuid) => {
            const coll = await this.prisma.tcg_collections.findUnique({
              where: {
                id_tcg_collection: collUuid,
              },
            });
            return coll;
          }),
        );
        collectionsArray = await Promise.all(fetchedCollections);
      }

      // Fetch attachment IDs associated with the ticket
      const attachments = await this.prisma.tcg_attachments.findMany({
        where: {
          id_tcg_ticket: ticket.id_tcg_ticket,
        },
      });

      // Transform to UnifiedTicketingTicketOutput format
      const unifiedTicket: UnifiedTicketingTicketOutput = {
        id: ticket.id_tcg_ticket,
        name: ticket.name || null,
        status: ticket.status || null,
        description: ticket.description || null,
        due_date: ticket.due_date || null,
        type: ticket.ticket_type || null,
        parent_ticket: ticket.parent_ticket || null,
        completed_at: ticket.completed_at || null,
        priority: ticket.priority || null,
        assigned_to: ticket.assigned_to || null,
        field_mappings: field_mappings,
        tags: tagsArray || null,
        collections: collectionsArray || null,
        attachments: attachments || null,
        remote_id: ticket.remote_id,
        created_at: ticket.created_at,
        modified_at: ticket.modified_at,
      };
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: ticket.id_tcg_ticket,
          },
        });
        const remote_data = JSON.parse(resp.data);
        unifiedTicket.remote_data = remote_data;
      }
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connection_id,
            id_project: project_id,
            id_event: uuidv4(),
            status: 'success',
            type: 'ticketing.ticket.pull',
            method: 'GET',
            url: '/ticketing/ticket',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }
      return unifiedTicket;
    } catch (error) {
      throw error;
    }
  }

  async getTickets(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedTicketingTicketOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced

      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_tickets.findFirst({
          where: {
            id_connection: connection_id,
            id_tcg_ticket: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const tickets = await this.prisma.tcg_tickets.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_ticket: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
        /* TODO: only if params 
        include: {
          tcg_comments: true,
        },*/
      });

      if (tickets.length === limit + 1) {
        next_cursor = Buffer.from(
          tickets[tickets.length - 1].id_tcg_ticket,
        ).toString('base64');
        tickets.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedTickets: UnifiedTicketingTicketOutput[] = await Promise.all(
        tickets.map(async (ticket) => {
          // Fetch field mappings for the ticket
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: ticket.id_tcg_ticket,
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

          let tagsArray;
          if (ticket.tags) {
            const fetchedTags = await Promise.all(
              ticket.tags.map(async (tagUuid) => {
                const tag = await this.prisma.tcg_tags.findUnique({
                  where: {
                    id_tcg_tag: tagUuid,
                  },
                });
                return tag;
              }),
            );
            tagsArray = await Promise.all(fetchedTags);
          }

          let collectionsArray;
          if (ticket.collections) {
            const fetchedCollections = await Promise.all(
              ticket.collections.map(async (collUuid) => {
                const coll = await this.prisma.tcg_collections.findUnique({
                  where: {
                    id_tcg_collection: collUuid,
                  },
                });
                return coll;
              }),
            );
            collectionsArray = await Promise.all(fetchedCollections);
          }

          // Fetch attachment IDs associated with the ticket
          const attachments = await this.prisma.tcg_attachments.findMany({
            where: {
              id_tcg_ticket: ticket.id_tcg_ticket,
            },
          });
          // Transform to UnifiedTicketingTicketOutput format
          const unifiedTicket: UnifiedTicketingTicketOutput = {
            id: ticket.id_tcg_ticket,
            name: ticket.name || null,
            status: ticket.status || null,
            description: ticket.description || null,
            due_date: ticket.due_date || null,
            type: ticket.ticket_type || null,
            parent_ticket: ticket.parent_ticket || null,
            completed_at: ticket.completed_at || null,
            priority: ticket.priority || null,
            assigned_to: ticket.assigned_to || [],
            tags: tagsArray || null,
            collections: collectionsArray || null,
            attachments: attachments || null,
            field_mappings: field_mappings,
            remote_id: ticket.remote_id,
            created_at: ticket.created_at,
            modified_at: ticket.modified_at,
          };
          return unifiedTicket;
        }),
      );

      let res: UnifiedTicketingTicketOutput[] = unifiedTickets;
      if (remote_data) {
        const remote_array_data: UnifiedTicketingTicketOutput[] =
          await Promise.all(
            res.map(async (ticket) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: ticket.id,
                },
              });
              //TODO:
              let remote_data: any;
              if (resp && resp.data) {
                remote_data = JSON.parse(resp.data);
              }
              return { ...ticket, remote_data };
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
          type: 'ticketing.ticket.pulled',
          method: 'GET',
          url: '/ticketing/tickets',
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
