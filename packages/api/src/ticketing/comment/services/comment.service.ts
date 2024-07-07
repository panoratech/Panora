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
  CommentCreatorType,
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(CommentService.name);
  }

  async addComment(
    unifiedCommentData: UnifiedCommentInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCommentOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      if (!linkedUser) throw new ReferenceError('Linked User Not Found');
      const tick = unifiedCommentData.ticket_id;
      //check if contact_id and account_id refer to real uuids
      if (tick) {
        const search = await this.prisma.tcg_tickets.findUnique({
          where: {
            id_tcg_ticket: tick,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a ticket_id which does not exist',
          );
      } else {
        throw new ReferenceError(
          'You must attach your comment to a ticket, specify a ticket_id',
        );
      }

      const contact = unifiedCommentData.contact_id;
      //check if contact_id and account_id refer to real uuids
      if (contact) {
        const search = await this.prisma.tcg_contacts.findUnique({
          where: {
            id_tcg_contact: contact,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a contact_id which does not exist',
          );
      }
      const user = unifiedCommentData.user_id;
      //check if contact_id and account_id refer to real uuids
      if (user) {
        const search = await this.prisma.tcg_users.findUnique({
          where: {
            id_tcg_user: user,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a user_id which does not exist',
          );
      }

      const attachmts = unifiedCommentData.attachments;
      if (attachmts && attachmts.length > 0) {
        if (typeof attachmts[0] === 'string') {
          // we have string array
          // check if attachments contains valid Attachment uuids
          attachmts.map(async (uuid: string) => {
            const search = await this.prisma.tcg_attachments.findUnique({
              where: {
                id_tcg_attachment: uuid,
              },
            });
            if (!search)
              throw new ReferenceError(
                'You inserted an attachment_id which does not exist',
              );
          });
        } else {
          // we have a nested attachment object to process
          const attchms_res = await this.registry
            .getService('ticketing', 'attachment')
            .saveToDb(
              connection_id,
              linkedUserId,
              attachmts,
              integrationId,
              [],
            );
          unifiedCommentData.attachments = attchms_res.map(
            (att) => att.id_tcg_attachment,
          );
        }
      }

      //desunify the data according to the target obj wanted
      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedCommentInput>({
          sourceObject: unifiedCommentData,
          targetType: TicketingObject.comment,
          providerName: integrationId,
          vertical: 'ticketing',
          customFieldMappings: [],
        });

      const service: ICommentService =
        this.serviceRegistry.getService(integrationId);
      //get remote_id of the ticket so the comment is inserted successfully
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: unifiedCommentData.ticket_id,
        },
        select: {
          remote_id: true,
        },
      });
      const resp: ApiResponse<OriginalCommentOutput> = await service.addComment(
        desunifiedObject,
        linkedUserId,
        ticket.remote_id,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalCommentOutput[]
      >({
        sourceObject: [resp.data],
        targetType: TicketingObject.comment,
        providerName: integrationId,
        vertical: 'ticketing',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedCommentOutput[];

      // add the comment inside our db
      const source_comment = resp.data;
      const target_comment = unifiedObject[0];

      const existingComment = await this.prisma.tcg_comments.findFirst({
        where: {
          remote_id: target_comment.remote_id,
          id_connection: connection_id,
        },
      });

      let unique_ticketing_comment_id: string;
      const opts =
        target_comment.creator_type === 'CONTACT'
          ? {
              id_tcg_contact: unifiedCommentData.contact_id,
            }
          : target_comment.creator_type === 'USER'
          ? {
              id_tcg_user: unifiedCommentData.user_id,
            }
          : {}; //case where nothing is passed for creator or a not authorized value;

      if (existingComment) {
        // Update the existing comment
        let data: any = {
          id_tcg_ticket: unifiedCommentData.ticket_id,
          modified_at: new Date(),
        };
        if (target_comment.body) {
          data = { ...data, body: target_comment.body };
        }
        if (target_comment.html_body) {
          data = { ...data, html_body: target_comment.html_body };
        }
        if (target_comment.is_private) {
          data = { ...data, is_private: target_comment.is_private };
        }
        if (target_comment.creator_type) {
          data = { ...data, creator_type: target_comment.creator_type };
        }
        data = { ...data, ...opts };

        const res = await this.prisma.tcg_comments.update({
          where: {
            id_tcg_comment: existingComment.id_tcg_comment,
          },
          data: data,
        });
        unique_ticketing_comment_id = res.id_tcg_comment;
      } else {
        // Create a new comment
        this.logger.log('comment not exists');
        let data: any = {
          id_tcg_comment: uuidv4(),
          created_at: new Date(),
          modified_at: new Date(),
          id_tcg_ticket: unifiedCommentData.ticket_id,
          remote_id: target_comment.remote_id,
          id_connection: connection_id,
        };

        if (target_comment.body) {
          data = { ...data, body: target_comment.body };
        }
        if (target_comment.html_body) {
          data = { ...data, html_body: target_comment.html_body };
        }
        if (target_comment.is_private) {
          data = { ...data, is_private: target_comment.is_private };
        }
        if (target_comment.creator_type) {
          data = { ...data, creator_type: target_comment.creator_type };
        }
        data = { ...data, ...opts };

        const res = await this.prisma.tcg_comments.create({
          data: data,
        });
        unique_ticketing_comment_id = res.id_tcg_comment;
      }

      // update parent comment id on attachment objects

      const uuids = unifiedCommentData.attachments as string[];

      await Promise.all(
        uuids.map(async (uuid) => {
          const res = await this.prisma.tcg_attachments.update({
            where: {
              id_tcg_attachment: uuid,
            },
            data: {
              id_tcg_comment: unique_ticketing_comment_id,
            },
          });
        }),
      );
      //insert remote_data in db
      await this.prisma.remote_data.upsert({
        where: {
          ressource_owner_id: unique_ticketing_comment_id,
        },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_ticketing_comment_id,
          format: 'json',
          data: JSON.stringify(source_comment),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_comment),
          created_at: new Date(),
        },
      });

      const result_comment = await this.getComment(
        unique_ticketing_comment_id,
        undefined,
        undefined,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ticketing.comment.push', //sync, push or pull
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

  async getComment(
    id_commenting_comment: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCommentOutput> {
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));*/

      // Fetch attachment IDs associated with the ticket
      const attachments = await this.prisma.tcg_attachments.findMany({
        where: {
          id_tcg_ticket: comment.id_tcg_ticket,
        },
      });

      // Transform to UnifiedCommentOutput format
      const unifiedComment: UnifiedCommentOutput = {
        id: comment.id_tcg_comment,
        body: comment.body,
        html_body: comment.html_body,
        is_private: comment.is_private,
        creator_type: comment.creator_type as CommentCreatorType,
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
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCommentOutput[];
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

      const unifiedComments: UnifiedCommentOutput[] = await Promise.all(
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
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );*/
          const attachments = await this.prisma.tcg_attachments.findMany({
            where: {
              id_tcg_ticket: comment.id_tcg_ticket,
            },
          });
          // Transform to UnifiedCommentOutput format
          return {
            id: comment.id_tcg_comment,
            body: comment.body,
            html_body: comment.html_body,
            is_private: comment.is_private,
            creator_type: comment.creator_type as CommentCreatorType,
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

      let res: UnifiedCommentOutput[] = unifiedComments;

      if (remote_data) {
        const remote_array_data: UnifiedCommentOutput[] = await Promise.all(
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
