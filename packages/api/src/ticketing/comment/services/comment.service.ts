import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { v4 as uuidv4 } from 'uuid';
import { ICommentService } from '../types';
import {
  UnifiedTicketingCommentInput,
  UnifiedTicketingCommentOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(CommentService.name);
  }

  async addComment(
    unifiedCommentData: UnifiedTicketingCommentInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingCommentOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      await this.validateTicketId(unifiedCommentData.ticket_id);
      await this.validateContactId(unifiedCommentData.contact_id);
      await this.validateUserId(unifiedCommentData.user_id);
      unifiedCommentData.attachments = await this.processAttachments(
        unifiedCommentData.attachments,
        connection_id,
        linkedUserId,
        integrationId,
      );

      // Desunify the data according to the target object wanted
      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedTicketingCommentInput>({
          sourceObject: unifiedCommentData,
          targetType: TicketingObject.comment,
          providerName: integrationId,
          vertical: 'ticketing',
          customFieldMappings: [],
        });

      const service: ICommentService =
        this.serviceRegistry.getService(integrationId);
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: { id_tcg_ticket: unifiedCommentData.ticket_id },
        select: { remote_id: true },
      });

      const resp: ApiResponse<OriginalCommentOutput> = await service.addComment(
        desunifiedObject,
        linkedUserId,
        ticket.remote_id,
      );

      // Unify the data according to the target object wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalCommentOutput[]
      >({
        sourceObject: [resp.data],
        targetType: TicketingObject.comment,
        providerName: integrationId,
        vertical: 'ticketing',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedTicketingCommentOutput[];

      // Add the comment inside our db
      const source_comment = resp.data;
      const target_comment = unifiedObject[0];

      const unique_ticketing_comment_id = await this.saveOrUpdateComment(
        target_comment,
        unifiedCommentData,
        connection_id,
      );

      await this.updateAttachmentParentId(
        unifiedCommentData.attachments as string[],
        unique_ticketing_comment_id,
      );

      await this.ingestService.processRemoteData(
        unique_ticketing_comment_id,
        source_comment,
      );

      const result_comment = await this.getComment(
        unique_ticketing_comment_id,
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
          type: 'ticketing.comment.push', // sync, push or pull
          method: 'POST',
          url: '/ticketing/comments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_comment,
        'ticketing.comment.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_comment;
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

  async validateTicketId(ticketId?: string) {
    if (ticketId) {
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: { id_tcg_ticket: ticketId },
      });
      if (!ticket)
        throw new ReferenceError(
          'You inserted a ticket_id which does not exist',
        );
    } else {
      throw new ReferenceError(
        'You must attach your comment to a ticket, specify a ticket_id',
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

  async validateUserId(userId?: string) {
    if (userId) {
      const user = await this.prisma.tcg_users.findUnique({
        where: { id_tcg_user: userId },
      });
      if (!user)
        throw new ReferenceError('You inserted a user_id which does not exist');
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

  async saveOrUpdateComment(
    comment: UnifiedTicketingCommentOutput,
    unifiedCommentData: UnifiedTicketingCommentInput,
    connection_id: string,
  ): Promise<string> {
    const existingComment = await this.prisma.tcg_comments.findFirst({
      where: { remote_id: comment.remote_id, id_connection: connection_id },
    });

    const data: any = {
      id_tcg_ticket: unifiedCommentData.ticket_id,
      modified_at: new Date(),
      body: comment.body,
      html_body: comment.html_body,
      is_private: comment.is_private,
      creator_type: comment.creator_type,
      ...this.getCommentCreatorOptions(comment, unifiedCommentData),
    };

    if (existingComment) {
      const res = await this.prisma.tcg_comments.update({
        where: { id_tcg_comment: existingComment.id_tcg_comment },
        data: data,
      });
      return res.id_tcg_comment;
    } else {
      data.created_at = new Date();
      data.remote_id = comment.remote_id;
      data.id_connection = connection_id;
      data.id_tcg_comment = uuidv4();

      const res = await this.prisma.tcg_comments.create({ data: data });
      return res.id_tcg_comment;
    }
  }

  getCommentCreatorOptions(
    comment: UnifiedTicketingCommentOutput,
    unifiedCommentData: UnifiedTicketingCommentInput,
  ) {
    return comment.creator_type === 'CONTACT'
      ? { id_tcg_contact: unifiedCommentData.contact_id }
      : comment.creator_type === 'USER'
      ? { id_tcg_user: unifiedCommentData.user_id }
      : {};
  }

  async updateAttachmentParentId(attachments: string[], commentId: string) {
    await Promise.all(
      attachments.map(async (uuid) => {
        await this.prisma.tcg_attachments.update({
          where: { id_tcg_attachment: uuid },
          data: { id_tcg_comment: commentId },
        });
      }),
    );
  }

  async getComment(
    id_commenting_comment: string,
    linkedUserId: string,
    connection_id: string,
    integrationId: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingCommentOutput> {
    try {
      const comment = await this.prisma.tcg_comments.findUnique({
        where: {
          id_tcg_comment: id_commenting_comment,
        },
      });

      // WE SHOULDNT HAVE FIELD MAPPINGS TO COMMENT

      // Fetch field mappings for the comment
      /*const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: comment.id_tcg_comment,
          },
        },
        include: {
          attribute: true,
        },
      });

      Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Object.fromEntries(fieldMappingsMap);*/

      // Fetch attachment IDs associated with the ticket
      const attachments = await this.prisma.tcg_attachments.findMany({
        where: {
          id_tcg_ticket: comment.id_tcg_ticket,
        },
      });

      // Transform to UnifiedTicketingCommentOutput format
      const unifiedComment: UnifiedTicketingCommentOutput = {
        id: comment.id_tcg_comment,
        body: comment.body,
        html_body: comment.html_body,
        is_private: comment.is_private,
        creator_type: comment.creator_type,
        ticket_id: comment.id_tcg_ticket,
        contact_id: comment.id_tcg_contact, // uuid of Contact object
        user_id: comment.id_tcg_user, // uuid of User object
        attachments: attachments || null,
        remote_id: comment.remote_id,
        created_at: comment.created_at,
        modified_at: comment.modified_at,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: comment.id_tcg_comment,
          },
        });
        const remote_data = JSON.parse(resp.data);
        unifiedComment.remote_data = remote_data;
      }
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connection_id,
            id_project: project_id,
            id_event: uuidv4(),
            status: 'success',
            type: 'ticketing.comment.pull',
            method: 'GET',
            url: '/ticketing/comment',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }
      return unifiedComment;
    } catch (error) {
      throw error;
    }
  }

  async getComments(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedTicketingCommentOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_comments.findFirst({
          where: {
            id_connection: connection_id,
            id_tcg_comment: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const comments = await this.prisma.tcg_comments.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_comment: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (comments.length === limit + 1) {
        next_cursor = Buffer.from(
          comments[comments.length - 1].id_tcg_comment,
        ).toString('base64');
        comments.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedComments: UnifiedTicketingCommentOutput[] =
        await Promise.all(
          comments.map(async (comment) => {
            //WE SHOULDNT HAVE FIELD MAPPINGS FOR COMMENT
            // Fetch field mappings for the ticket
            /*const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: comment.id_tcg_ticket,
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
const field_mappings = Object.fromEntries(fieldMappingsMap);*/
            const attachments = await this.prisma.tcg_attachments.findMany({
              where: {
                id_tcg_ticket: comment.id_tcg_ticket,
              },
            });
            // Transform to UnifiedTicketingCommentOutput format
            return {
              id: comment.id_tcg_comment,
              body: comment.body,
              html_body: comment.html_body,
              is_private: comment.is_private,
              creator_type: comment.creator_type,
              ticket_id: comment.id_tcg_ticket,
              contact_id: comment.id_tcg_contact, // uuid of Contact object
              user_id: comment.id_tcg_user, // uuid of User object
              attachments: attachments || null,
              remote_id: comment.remote_id,
              created_at: comment.created_at,
              modified_at: comment.modified_at,
            };
          }),
        );

      let res: UnifiedTicketingCommentOutput[] = unifiedComments;

      if (remote_data) {
        const remote_array_data: UnifiedTicketingCommentOutput[] =
          await Promise.all(
            res.map(async (comment) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: comment.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...comment, remote_data };
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
          type: 'ticketing.comment.pulled',
          method: 'GET',
          url: '/ticketing/comments',
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
