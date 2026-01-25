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
    this.logger.log('addTicket function started'); 
    try {
      this.logger.log('Validating linked user...');
      const linkedUser = await this.validateLinkedUser(linkedUserId);

      this.logger.log('Validating account ID...');
      await this.validateAccountId(unifiedTicketData.account_id);

      this.logger.log('Validating contact ID...');
      await this.validateContactId(unifiedTicketData.contact_id);

      this.logger.log('Validating assignees...');
      await this.validateAssignees(unifiedTicketData.assigned_to);

      unifiedTicketData.attachments = await this.processAttachments(
        unifiedTicketData.attachments,
        connection_id,
        linkedUserId,
        integrationId,
      );

      // Retrieve custom field mappings
      this.logger.log('Fetching custom field mappings...');
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.ticket',
        );

      this.logger.log('Desunifying ticket data...');
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
        'Ticket desunified: ' + JSON.stringify(desunifiedObject),
      );

      const service: ITicketService =
        this.serviceRegistry.getService(integrationId);

      this.logger.log('Adding ticket using external service...');
      const resp: ApiResponse<OriginalTicketOutput> = await service.addTicket(
        desunifiedObject,
        linkedUserId,
      );

      this.logger.log('Unifying ticket data...');
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

      const source_ticket = resp.data;
      const target_ticket = unifiedObject[0];

      this.logger.log('Saving or updating ticket...');
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

      this.logger.log('Fetching ticket...');
      const result_ticket = await this.getTicket(
        unique_ticketing_ticket_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      this.logger.log('Creating event...');
      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: status_resp,
          type: 'ticketing.ticket.push',
          method: 'PUSH',
          url: '/ticketing/tickets',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      this.logger.log('Dispatching webhook...');
      await this.webhook.dispatchWebhook(
        result_ticket,
        'ticketing.ticket.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_ticket;
    } catch (error) {
      this.logger.error('Error in addTicket function:', error.message, error.stack);
      throw error;
    }
  }

  async validateLinkedUser(linkedUserId: string) {
    this.logger.log(`Validating linked user with ID: ${linkedUserId}`);
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) {
      this.logger.error(`Linked User with ID ${linkedUserId} not found.`, '', 'validateLinkedUser');
      throw new ReferenceError('Linked User Not Found');
    }
    return linkedUser;
  }

  async validateAccountId(accountId?: string) {
    if (accountId) {
      this.logger.log(`Validating account with ID: ${accountId}`);
      const account = await this.prisma.tcg_accounts.findUnique({
        where: { id_tcg_account: accountId },
      });
      if (!account) {
        this.logger.error(`Account with ID ${accountId} not found.`, '', 'validateAccountId');
        throw new ReferenceError(
          'You inserted an account_id which does not exist',
        );
      }
    }
  }

  async validateContactId(contactId?: string) {
    if (contactId) {
      this.logger.log(`Validating contact with ID: ${contactId}`);
      const contact = await this.prisma.tcg_contacts.findUnique({
        where: { id_tcg_contact: contactId },
      });
      if (!contact) {
        this.logger.error(`Contact with ID ${contactId} not found.`, '', 'validateContactId');
        throw new ReferenceError(
          'You inserted a contact_id which does not exist',
        );
      }
    }
  }

  async validateAssignees(assignees?: string[]) {
    if (assignees && assignees.length > 0) {
      this.logger.log(`Validating assignees: ${assignees.join(', ')}`);
      await Promise.all(
        assignees.map(async (assignee) => {
          const user = await this.prisma.tcg_users.findUnique({
            where: { id_tcg_user: assignee },
          });
          if (!user) {
            this.logger.error(`Assignee ${assignee} not found.`, '', 'validateAssignees');
            throw new ReferenceError(
              'You inserted an assignee which does not exist',
            );
          }
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
    this.logger.log('Processing attachments...');
    if (attachments && attachments.length > 0) {
      if (typeof attachments[0] === 'string') {
        await Promise.all(
          attachments.map(async (uuid: string) => {
            const attachment = await this.prisma.tcg_attachments.findUnique({
              where: { id_tcg_attachment: uuid },
            });
            if (!attachment) {
              this.logger.error(`Attachment ${uuid} not found.`, '', 'processAttachments');
              throw new ReferenceError(
                'You inserted an attachment_id which does not exist',
              );
            }
          }),
        );
        return attachments;
      } else {
        this.logger.log('Saving attachments to DB...');
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
    this.logger.log(`Saving or updating ticket with remote ID: ${ticket.remote_id}`);
    const existingTicket = await this.prisma.tcg_tickets.findFirst({
      where: { remote_id: ticket.remote_id, id_connection: connection_id },
    });

    const data: any = {
      id_tcg_ticket: uuidv4(),
      modified_at: new Date(),
      name: ticket.name,
      status: ticket.status,
      priority: ticket.priority,
      source: ticket.source,
      remote_id: ticket.remote_id,
      id_connection: connection_id,
    };

    if (existingTicket) {
      this.logger.log(`Ticket with remote ID ${ticket.remote_id} found, updating...`);
      await this.prisma.tcg_tickets.update({
        where: { id_tcg_ticket: existingTicket.id_tcg_ticket },
        data: { ...data, modified_at: new Date() },
      });
      return existingTicket.id_tcg_ticket;
    } else {
      this.logger.log(`Ticket with remote ID ${ticket.remote_id} not found, creating...`);
      return this.prisma.tcg_tickets.create({
        data,
      }).then((createdTicket) => createdTicket.id_tcg_ticket);
    }
  }
}
