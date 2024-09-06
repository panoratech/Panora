import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalNoteOutput } from '@@core/utils/types/original/original.crm';
import { CrmObject } from '@crm/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { INoteService } from '../types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class NoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(NoteService.name);
  }

  async addNote(
    unifiedNoteData: UnifiedCrmNoteInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmNoteOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      await this.validateUserId(unifiedNoteData.user_id);
      await this.validateCompanyId(unifiedNoteData.company_id);
      await this.validateContactId(unifiedNoteData.contact_id);
      await this.validateDealId(unifiedNoteData.deal_id);

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.note',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedCrmNoteInput>({
          sourceObject: unifiedNoteData,
          targetType: CrmObject.note,
          providerName: integrationId,
          vertical: 'crm',
          customFieldMappings: [],
        });

      const service: INoteService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalNoteOutput> = await service.addNote(
        desunifiedObject,
        linkedUserId,
      );

      const unifiedObject = (await this.coreUnification.unify<
        OriginalNoteOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.note,
        providerName: integrationId,
        vertical: 'crm',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedCrmNoteOutput[];

      const source_note = resp.data;
      const target_note = unifiedObject[0];

      const unique_crm_note_id = await this.saveOrUpdateNote(
        target_note,
        connection_id,
      );

      await this.ingestService.processFieldMappings(
        target_note.field_mappings,
        unique_crm_note_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_crm_note_id,
        source_note,
      );

      const result_note = await this.getNote(
        unique_crm_note_id,
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
          type: 'crm.note.push', // sync, push or pull
          method: 'POST',
          url: '/crm/notes',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_note,
        'crm.note.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_note;
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

  async validateUserId(userId?: string) {
    if (userId) {
      const user = await this.prisma.crm_users.findUnique({
        where: { id_crm_user: userId },
      });
      if (!user)
        throw new ReferenceError('You inserted a user_id which does not exist');
    }
  }

  async validateCompanyId(companyId?: string) {
    if (companyId) {
      const company = await this.prisma.crm_companies.findUnique({
        where: { id_crm_company: companyId },
      });
      if (!company)
        throw new ReferenceError(
          'You inserted a company_id which does not exist',
        );
    }
  }

  async validateContactId(contactId?: string) {
    if (contactId) {
      const contact = await this.prisma.crm_contacts.findUnique({
        where: { id_crm_contact: contactId },
      });
      if (!contact)
        throw new ReferenceError(
          'You inserted a contact_id which does not exist',
        );
    }
  }

  async validateDealId(dealId?: string) {
    if (dealId) {
      const deal = await this.prisma.crm_deals.findUnique({
        where: { id_crm_deal: dealId },
      });
      if (!deal)
        throw new ReferenceError('You inserted a deal_id which does not exist');
    }
  }

  async saveOrUpdateNote(
    note: UnifiedCrmNoteOutput,
    connection_id: string,
  ): Promise<string> {
    const existingNote = await this.prisma.crm_notes.findFirst({
      where: { remote_id: note.remote_id, id_connection: connection_id },
    });

    const data: any = {
      modified_at: new Date(),
      content: note.content,
      id_crm_contact: note.contact_id,
      id_crm_company: note.company_id,
      id_crm_deal: note.deal_id,
      id_crm_user: note.user_id,
    };

    if (existingNote) {
      const res = await this.prisma.crm_notes.update({
        where: { id_crm_note: existingNote.id_crm_note },
        data: data,
      });
      return res.id_crm_note;
    } else {
      data.created_at = new Date();
      data.remote_id = note.remote_id;
      data.id_connection = connection_id;
      data.id_crm_note = uuidv4();

      const newNote = await this.prisma.crm_notes.create({ data: data });
      return newNote.id_crm_note;
    }
  }

  async getNote(
    id_note: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmNoteOutput> {
    try {
      const note = await this.prisma.crm_notes.findUnique({
        where: {
          id_crm_note: id_note,
        },
      });

      // Fetch field mappings for the note
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: note.id_crm_note,
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
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedCrmNoteOutput format
      const unifiedNote: UnifiedCrmNoteOutput = {
        id: note.id_crm_note,
        content: note.content,
        company_id: note.id_crm_company,
        contact_id: note.id_crm_contact, // uuid of Contact object
        deal_id: note.id_crm_deal, // uuid of Contact object
        user_id: note.id_crm_user,
        field_mappings: field_mappings,
        remote_id: note.remote_id,
        created_at: note.created_at,
        modified_at: note.modified_at,
      };

      let res: UnifiedCrmNoteOutput = {
        ...unifiedNote,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: note.id_crm_note,
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
            type: 'crm.note.pull',
            method: 'GET',
            url: '/crm/note',
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

  async getNotes(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCrmNoteOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_notes.findFirst({
          where: {
            id_connection: connection_id,
            id_crm_note: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const notes = await this.prisma.crm_notes.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_note: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (notes.length === limit + 1) {
        next_cursor = Buffer.from(notes[notes.length - 1].id_crm_note).toString(
          'base64',
        );
        notes.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedNotes: UnifiedCrmNoteOutput[] = await Promise.all(
        notes.map(async (note) => {
          // Fetch field mappings for the ticket
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: note.id_crm_note,
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

          // Transform to UnifiedCrmNoteOutput format
          return {
            id: note.id_crm_note,
            content: note.content,
            company_id: note.id_crm_company,
            contact_id: note.id_crm_contact, // uuid of Contact object
            deal_id: note.id_crm_deal, // uuid of Contact object
            user_id: note.id_crm_user,
            field_mappings: field_mappings,
            remote_id: note.remote_id,
            created_at: note.created_at,
            modified_at: note.modified_at,
          };
        }),
      );

      let res: UnifiedCrmNoteOutput[] = unifiedNotes;

      if (remote_data) {
        const remote_array_data: UnifiedCrmNoteOutput[] = await Promise.all(
          res.map(async (note) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: note.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...note, remote_data };
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
          type: 'crm.note.pulled',
          method: 'GET',
          url: '/crm/notes',
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
