import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedLeadInput, UnifiedLeadOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { CrmObject } from '@crm/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalLeadOutput } from '@@core/utils/types/original/original.crm';
import { unify } from '@@core/utils/unification/unify';
import { ILeadService } from '../types';

@Injectable()
export class LeadService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(LeadService.name);
  }

  async batchAddLeads(
    unifiedLeadData: UnifiedLeadInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedLeadOutput[]> {
    try {
      const responses = await Promise.all(
        unifiedLeadData.map((unifiedData) =>
          this.addLead(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      return responses;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async addLead(
    unifiedLeadData: UnifiedLeadInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedLeadOutput> {
    /*try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      //CHECKS
      if (!linkedUser) throw new Error('Linked User Not Found');
      const tick = unifiedLeadData.ticket_id;
      //check if contact_id and account_id refer to real uuids
      if (tick) {
        const search = await this.prisma.tcg_tickets.findUnique({
          where: {
            id_tcg_ticket: tick,
          },
        });
        if (!search)
          throw new Error('You inserted a ticket_id which does not exist');
      }

      const contact = unifiedLeadData.contact_id;
      //check if contact_id and account_id refer to real uuids
      if (contact) {
        const search = await this.prisma.tcg_contacts.findUnique({
          where: {
            id_tcg_contact: contact,
          },
        });
        if (!search)
          throw new Error('You inserted a contact_id which does not exist');
      }
      const user = unifiedLeadData.user_id;
      //check if contact_id and account_id refer to real uuids
      if (user) {
        const search = await this.prisma.tcg_users.findUnique({
          where: {
            id_tcg_user: user,
          },
        });
        if (!search)
          throw new Error('You inserted a user_id which does not exist');
      }

      const attachmts = unifiedLeadData.attachments;
      //CHEK IF attachments contains valid Attachment uuids
      if (attachmts && attachmts.length > 0) {
        attachmts.map(async (attachmt) => {
          const search = await this.prisma.tcg_attachments.findUnique({
            where: {
              id_tcg_attachment: attachmt,
            },
          });
          if (!search)
            throw new Error(
              'You inserted an attachment_id which does not exist',
            );
        });
      }

      //desunify the data according to the target obj wanted
      const desunifiedObject = await desunify<UnifiedLeadInput>({
        sourceObject: unifiedLeadData,
        targetType: CrmObject.lead,
        providerName: integrationId,
        customFieldMappings: [],
      });

      const service: ILeadService =
        this.serviceRegistry.getService(integrationId);
      //get remote_id of the ticket so the lead is inserted successfully
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: unifiedLeadData.ticket_id,
        },
        select: {
          remote_id: true,
        },
      });
      if (!ticket)
        throw new Error('ticket does not exist for the lead you try to create');
      const resp: ApiResponse<OriginalLeadOutput> = await service.addLead(
        desunifiedObject,
        linkedUserId,
        ticket.remote_id,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalLeadOutput[]>({
        sourceObject: [resp.data],
        targetType: CrmObject.lead,
        providerName: integrationId,
        customFieldMappings: [],
      })) as UnifiedLeadOutput[];

      // add the lead inside our db
      const source_lead = resp.data;
      const target_lead = unifiedObject[0];
      const originId = 'id' in source_lead ? String(source_lead.id) : undefined; //TODO

      const existingLead = await this.prisma.tcg_leads.findFirst({
        where: {
          remote_id: originId,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_ticketing_lead_id: string;
      const opts =
        target_lead.creator_type === 'contact'
          ? {
              id_tcg_contact: unifiedLeadData.contact_id,
            }
          : target_lead.creator_type === 'user'
          ? {
              id_tcg_user: unifiedLeadData.user_id,
            }
          : {}; //case where nothing is passed for creator or a not authorized value;

      if (existingLead) {
        // Update the existing lead
        let data: any = {
          id_tcg_ticket: unifiedLeadData.ticket_id,
          modified_at: new Date(),
        };
        if (target_lead.body) {
          data = { ...data, body: target_lead.body };
        }
        if (target_lead.html_body) {
          data = { ...data, html_body: target_lead.html_body };
        }
        if (target_lead.is_private) {
          data = { ...data, is_private: target_lead.is_private };
        }
        if (target_lead.creator_type) {
          data = { ...data, creator_type: target_lead.creator_type };
        }
        data = { ...data, ...opts };

        const res = await this.prisma.tcg_leads.update({
          where: {
            id_tcg_lead: existingLead.id_tcg_lead,
          },
          data: data,
        });
        unique_ticketing_lead_id = res.id_tcg_lead;
      } else {
        // Create a new lead
        this.logger.log('lead not exists');
        let data: any = {
          id_tcg_lead: uuidv4(),
          created_at: new Date(),
          modified_at: new Date(),
          id_tcg_ticket: unifiedLeadData.ticket_id,
          id_linked_user: linkedUserId,
          remote_id: originId,
          remote_platform: integrationId,
        };

        if (target_lead.body) {
          data = { ...data, body: target_lead.body };
        }
        if (target_lead.html_body) {
          data = { ...data, html_body: target_lead.html_body };
        }
        if (target_lead.is_private) {
          data = { ...data, is_private: target_lead.is_private };
        }
        if (target_lead.creator_type) {
          data = { ...data, creator_type: target_lead.creator_type };
        }
        data = { ...data, ...opts };

        const res = await this.prisma.tcg_leads.create({
          data: data,
        });
        unique_ticketing_lead_id = res.id_tcg_lead;
      }

      //insert remote_data in db
      await this.prisma.remote_data.upsert({
        where: {
          ressource_owner_id: unique_ticketing_lead_id,
        },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_ticketing_lead_id,
          format: 'json',
          data: JSON.stringify(source_lead),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_lead),
          created_at: new Date(),
        },
      });

      const result_lead = await this.getLead(
        unique_ticketing_lead_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ticketing.lead.push', //sync, push or pull
          method: 'POST',
          url: '/ticketing/lead',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        result_lead,
        'ticketing.lead.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_lead;
    } catch (error) {
      handleServiceError(error, this.logger);
    }*/
    return;
  }

  async getLead(
    id_leading_lead: string,
    remote_data?: boolean,
  ): Promise<UnifiedLeadOutput> {
    /*try {
      const lead = await this.prisma.tcg_leads.findUnique({
        where: {
          id_tcg_lead: id_leading_lead,
        },
      });

      // WE SHOULDNT HAVE FIELD MAPPINGS TO COMMENT

      // Fetch field mappings for the lead
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: lead.id_tcg_lead,
          },
        },
        include: {
          attribute: true,
        },
      });

      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedLeadOutput format
      const unifiedLead: UnifiedLeadOutput = {
        id: lead.id_tcg_lead,
        body: lead.body,
        html_body: lead.html_body,
        is_private: lead.is_private,
        creator_type: lead.creator_type,
        ticket_id: lead.id_tcg_ticket,
        contact_id: lead.id_tcg_contact, // uuid of Contact object
        user_id: lead.id_tcg_user, // uuid of User object
      };

      let res: UnifiedLeadOutput = {
        ...unifiedLead,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: lead.id_tcg_lead,
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
      handleServiceError(error, this.logger);
    }*/
    return;
  }

  async getLeads(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedLeadOutput[]> {
    /*try {
      const leads = await this.prisma.tcg_leads.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unifiedLeads: UnifiedLeadOutput[] = await Promise.all(
        leads.map(async (lead) => {
          //WE SHOULDNT HAVE FIELD MAPPINGS FOR COMMENT
          // Fetch field mappings for the ticket
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: lead.id_tcg_ticket,
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

          // Transform to UnifiedLeadOutput format
          return {
            id: lead.id_tcg_lead,
            body: lead.body,
            html_body: lead.html_body,
            is_private: lead.is_private,
            creator_type: lead.creator_type,
            ticket_id: lead.id_tcg_ticket,
            contact_id: lead.id_tcg_contact, // uuid of Contact object
            user_id: lead.id_tcg_user, // uuid of User object
          };
        }),
      );

      let res: UnifiedLeadOutput[] = unifiedLeads;

      if (remote_data) {
        const remote_array_data: UnifiedLeadOutput[] = await Promise.all(
          res.map(async (lead) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: lead.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...lead, remote_data };
          }),
        );
        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.lead.pulled',
          method: 'GET',
          url: '/ticketing/lead',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }*/
    return;
  }
}
